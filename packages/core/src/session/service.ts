import * as db from "../db/postgres/schema.js";

import { Context, Effect, Layer, Option, pipe } from "effect";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { DrizzlePostgresProvider } from "../services/db/postgres/provider.js";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { TokenType } from "../services/auth/token.js";
import { PaginatedAndCounted, PaginatedQuery } from "@billo-blog/contract";

export type UserSession = {
  type: "user";
  session: db.Session;
};
export type ApiSession = {
  type: "api";
  apiToken: db.ApiToken;
};
export type Session = UserSession | ApiSession;
export type SessionWithUser = Session & {
  user: db.User;
};
export type SessionToken = string;

export const CreateLongLivedSessionRequest = z.object({
  userId: z.number(),
  name: z.string(),
  description: z.string().optional(),
  permission: z.enum(["read", "write"]),
  expiresAt: z.number().optional(),
});
export type CreateLongLivedSessionRequest = z.infer<
  typeof CreateLongLivedSessionRequest
>;

export const CreateLongLivedSessionResponse = z.object({
  tokenId: z.string(),
  accessToken: z.string(),
});
export type CreateLongLivedSessionResponse = z.infer<
  typeof CreateLongLivedSessionResponse
>;

export const ValidateSessionTokenRequest = z.object({
  sessionToken: z.string(),
  type: TokenType,
});
export type ValidateSessionTokenRequest = z.infer<
  typeof ValidateSessionTokenRequest
>;
export const ApiToken = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  permission: z.enum(["read", "write"]),
  isRevoked: z.boolean(),
  lastUsedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
});
export type ApiToken = z.infer<typeof ApiToken>;
export const GetApiTokensRequest = PaginatedQuery.extend({
  userId: z.number(),
});
export type GetApiTokensRequest = z.infer<typeof GetApiTokensRequest>;
export const GetApiTokensResponse = PaginatedAndCounted.extend({
  apiTokens: z.array(ApiToken),
});
export type GetApiTokensResponse = z.infer<typeof GetApiTokensResponse>;

export const GetApiTokenRequest = z.object({
  userId: z.number(),
  tokenId: z.string(),
});
export type GetApiTokenRequest = z.infer<typeof GetApiTokenRequest>;
export const GetApiTokenResponse = ApiToken;
export type GetApiTokenResponse = z.infer<typeof GetApiTokenResponse>;
export type ISessionService = {
  validateSessionToken: (
    request: ValidateSessionTokenRequest
  ) => Effect.Effect<Option.Option<SessionWithUser>, Error>;
  invalidateSession: (sessionId: string) => Effect.Effect<void, Error>;
  invalidateUserSessions: (userId: number) => Effect.Effect<void, Error>;
  generateSessionToken: () => Effect.Effect<SessionToken, never>;
  createUserSession: (userId: number) => Effect.Effect<SessionToken, Error>;
  createApiSession: (
    request: CreateLongLivedSessionRequest
  ) => Effect.Effect<CreateLongLivedSessionResponse, Error>;
  invalidateLongLivedSession: (sessionId: string) => Effect.Effect<void, Error>;
  getApiTokens: (
    request: GetApiTokensRequest
  ) => Effect.Effect<GetApiTokensResponse, Error>;
  getApiToken: (
    request: GetApiTokenRequest
  ) => Effect.Effect<Option.Option<ApiToken>, Error>;
};

export class SessionService extends Context.Tag("SessionService")<
  SessionService,
  ISessionService
>() {}

export const SessionServiceLive = Layer.effect(
  SessionService,
  Effect.gen(function* () {
    const { postgresDrizzle } = yield* DrizzlePostgresProvider;
    const EXPIRY_REFRESH_THRESHOLD = 1000 * 60 * 60 * 24 * 15;
    const EXPIRY_REFRESH_INTERVAL = 1000 * 60 * 60 * 24 * 30;

    const validateUserSessionToken = (
      token: string
    ): Effect.Effect<Option.Option<SessionWithUser>, Error> =>
      Effect.gen(function* () {
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );

        const sessionData = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(db.SessionsTable)
            .innerJoin(
              db.UsersTable,
              eq(db.SessionsTable.userId, db.UsersTable.internalId)
            )
            .where(eq(db.SessionsTable.id, sessionId))
            .limit(1)
            .execute()
        );

        if (!sessionData || sessionData.length === 0) {
          return Option.none<SessionWithUser>();
        }

        const { sessions, users } = sessionData[0]!;

        // Check if expired
        if (Date.now() >= sessions.expiresAt.getTime()) {
          yield* Effect.tryPromise(() =>
            postgresDrizzle
              .delete(db.SessionsTable)
              .where(eq(db.SessionsTable.id, sessions.id))
              .execute()
          );
          return Option.none<SessionWithUser>();
        }

        // Refresh if close to expiry
        if (
          Date.now() >=
          sessions.expiresAt.getTime() - EXPIRY_REFRESH_THRESHOLD
        ) {
          const newExpiresAt = new Date(Date.now() + EXPIRY_REFRESH_INTERVAL);
          yield* Effect.tryPromise(() =>
            postgresDrizzle
              .update(db.SessionsTable)
              .set({ expiresAt: newExpiresAt })
              .where(eq(db.SessionsTable.id, sessions.id))
              .execute()
          );
          sessions.expiresAt = newExpiresAt;
        }

        return Option.some({ type: "user", session: sessions, user: users });
      });

    const validateApiSessionToken = (
      token: string
    ): Effect.Effect<Option.Option<SessionWithUser>, Error> =>
      Effect.gen(function* () {
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );
        const longLivedSessionData = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(db.ApiTokensTable)
            .innerJoin(
              db.UsersTable,
              eq(db.ApiTokensTable.userId, db.UsersTable.internalId)
            )
            .where(eq(db.ApiTokensTable.tokenHash, sessionId))
            .limit(1)
            .execute()
        );

        if (!longLivedSessionData || longLivedSessionData.length === 0) {
          return Option.none<SessionWithUser>();
        }

        const { api_tokens: apiToken, users } = longLivedSessionData[0]!;
        if (apiToken.expiresAt && Date.now() >= apiToken.expiresAt.getTime()) {
          return Option.none<SessionWithUser>();
        }

        return Option.some({ type: "api", apiToken, user: users });
      });

    const validateSessionToken: ISessionService["validateSessionToken"] = (
      request
    ) =>
      request.type === "user"
        ? validateUserSessionToken(request.sessionToken)
        : validateApiSessionToken(request.sessionToken);

    const invalidateSession: ISessionService["invalidateSession"] = (
      sessionId
    ) =>
      Effect.tryPromise(() =>
        postgresDrizzle
          .delete(db.SessionsTable)
          .where(eq(db.SessionsTable.id, sessionId))
          .execute()
      );

    const invalidateUserSessions: ISessionService["invalidateUserSessions"] = (
      userId
    ) =>
      Effect.tryPromise(() =>
        postgresDrizzle
          .delete(db.SessionsTable)
          .where(eq(db.SessionsTable.userId, userId))
          .execute()
      );

    const generateSessionToken: ISessionService["generateSessionToken"] = () =>
      Effect.sync(() => {
        const tokenBytes = new Uint8Array(20);
        crypto.getRandomValues(tokenBytes);
        return encodeBase32(tokenBytes).toLowerCase();
      });

    const createUserSession: ISessionService["createUserSession"] = (userId) =>
      Effect.gen(function* () {
        const sessionToken = yield* generateSessionToken();
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(sessionToken))
        );

        const session = {
          id: sessionId,
          userId,
          expiresAt: generateDefaultExpiryDate(),
        };

        const createdSession = yield* Effect.tryPromise(() =>
          postgresDrizzle.insert(db.SessionsTable).values(session).returning()
        );

        if (createdSession.length === 0) {
          return Effect.fail(new Error("Failed to create session"));
        }

        return Effect.succeed(sessionToken);
      }).pipe(Effect.flatten);

    const createApiSession: ISessionService["createApiSession"] = ({
      userId,
      name,
      description,
      permission,
      expiresAt,
    }) =>
      Effect.gen(function* () {
        const sessionToken = yield* generateSessionToken();
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(sessionToken))
        );

        const createdLongLivedSession = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .insert(db.ApiTokensTable)
            .values({
              name,
              description,
              permission,
              tokenHash: sessionId,
              userId,
              expiresAt: expiresAt ? new Date(expiresAt) : null,
            })
            .returning()
        );

        if (createdLongLivedSession.length === 0) {
          return yield* Effect.fail(
            new Error("Failed to create long lived session")
          );
        }

        return {
          tokenId: sessionId,
          accessToken: sessionToken,
          expiresAt,
        };
      });

    const invalidateLongLivedSession: ISessionService["invalidateLongLivedSession"] =
      (longLivedSessionId) =>
        Effect.tryPromise(() =>
          postgresDrizzle
            .update(db.ApiTokensTable)
            .set({ isRevoked: true })
            .where(eq(db.ApiTokensTable.tokenHash, longLivedSessionId))
            .execute()
        );

    const getApiTokens: ISessionService["getApiTokens"] = (request) =>
      Effect.gen(function* () {
        const limit = request.limit ?? 10;
        const page = request.page ?? 0;
        const apiTokens = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(db.ApiTokensTable)
            .where(eq(db.ApiTokensTable.userId, request.userId))
            .limit(limit)
            .offset(page)
            .execute()
        );
        return {
          apiTokens: apiTokens.map((apiToken) => ({
            name: apiToken.name,
            id: apiToken.tokenHash,
            description: apiToken.description,
            permission: apiToken.permission,
            expiresAt: apiToken.expiresAt ?? null,
            isRevoked: apiToken.isRevoked,
            lastUsedAt: apiToken.lastUsedAt ?? null,
          })),
          limit,
          page,
          count: apiTokens.length,
        };
      });
    const getApiToken: ISessionService["getApiToken"] = ({ tokenId, userId }) =>
      Effect.gen(function* () {
        const token = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(db.ApiTokensTable)
            .where(
              and(
                eq(db.ApiTokensTable.tokenHash, tokenId),
                eq(db.ApiTokensTable.userId, userId)
              )
            )
            .limit(1)
            .execute()
        );
        if (token.length === 0) {
          return Option.none<ApiToken>();
        }
        return pipe(
          Option.some(token[0]!),
          Option.map((apiToken) => ({
            name: apiToken.name,
            id: apiToken.tokenHash,
            description: apiToken.description,
            permission: apiToken.permission,
            expiresAt: apiToken.expiresAt ?? null,
            isRevoked: apiToken.isRevoked,
            lastUsedAt: apiToken.lastUsedAt ?? null,
          }))
        );
      });
    return {
      validateSessionToken,
      invalidateSession,
      invalidateUserSessions,
      generateSessionToken,
      createUserSession,
      createApiSession,
      invalidateLongLivedSession,
      getApiTokens,
      getApiToken,
    };
  })
);
function generateDefaultExpiryDate() {
  return new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
}
