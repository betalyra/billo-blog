import type { Session, User } from "../db/postgres/schema.js";

import { Context, Effect, Layer, Option } from "effect";
import type { NewSession } from "../db/postgres/schema.js";
import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { DrizzlePostgresProvider } from "../services/db/postgres/provider.js";
import { SessionsTable, UsersTable } from "../db/postgres/schema.js";
import { eq } from "drizzle-orm";

export type SessionWithUser = {
  session: Session;
  user: User;
};
export type SessionToken = string;
export type ISessionService = {
  validateSessionToken: (
    token: string
  ) => Effect.Effect<Option.Option<SessionWithUser>, Error>;
  invalidateSession: (sessionId: string) => Effect.Effect<void, Error>;
  invalidateUserSessions: (userId: number) => Effect.Effect<void, Error>;
  generateSessionToken: () => Effect.Effect<SessionToken, never>;
  createSession: (userId: number) => Effect.Effect<SessionToken, Error>;
};

export class SessionService extends Context.Tag("SessionService")<
  SessionService,
  ISessionService
>() {}

export const SessionServiceLive = Layer.effect(
  SessionService,
  Effect.gen(function* () {
    const { postgresDrizzle } = yield* DrizzlePostgresProvider;

    const validateSessionToken: ISessionService["validateSessionToken"] = (
      token
    ) =>
      Effect.gen(function* () {
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(token))
        );

        const sessionData = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(SessionsTable)
            .innerJoin(
              UsersTable,
              eq(SessionsTable.userId, UsersTable.internalId)
            )
            .where(eq(SessionsTable.id, sessionId))
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
              .delete(SessionsTable)
              .where(eq(SessionsTable.id, sessions.id))
              .execute()
          );
          return Option.none<SessionWithUser>();
        }

        // Refresh if close to expiry
        if (
          Date.now() >=
          sessions.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15
        ) {
          const newExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
          yield* Effect.tryPromise(() =>
            postgresDrizzle
              .update(SessionsTable)
              .set({ expiresAt: newExpiresAt })
              .where(eq(SessionsTable.id, sessions.id))
              .execute()
          );
          sessions.expiresAt = newExpiresAt;
        }

        return Option.some({ session: sessions, user: users });
      });

    const invalidateSession: ISessionService["invalidateSession"] = (
      sessionId
    ) =>
      Effect.tryPromise(() =>
        postgresDrizzle
          .delete(SessionsTable)
          .where(eq(SessionsTable.id, sessionId))
          .execute()
      );

    const invalidateUserSessions: ISessionService["invalidateUserSessions"] = (
      userId
    ) =>
      Effect.tryPromise(() =>
        postgresDrizzle
          .delete(SessionsTable)
          .where(eq(SessionsTable.userId, userId))
          .execute()
      );

    const generateSessionToken: ISessionService["generateSessionToken"] = () =>
      Effect.sync(() => {
        const tokenBytes = new Uint8Array(20);
        crypto.getRandomValues(tokenBytes);
        return encodeBase32(tokenBytes).toLowerCase();
      });

    const createSession: ISessionService["createSession"] = (userId) =>
      Effect.gen(function* () {
        const sessionToken = yield* generateSessionToken();
        const sessionId = encodeHexLowerCase(
          sha256(new TextEncoder().encode(sessionToken))
        );

        const session = {
          id: sessionId,
          userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        };

        const createdSession = yield* Effect.tryPromise(() =>
          postgresDrizzle.insert(SessionsTable).values(session).returning()
        );

        if (createdSession.length === 0) {
          return Effect.fail(new Error("Failed to create session"));
        }

        return Effect.succeed(sessionToken);
      }).pipe(Effect.flatten);

    return {
      validateSessionToken,
      invalidateSession,
      invalidateUserSessions,
      generateSessionToken,
      createSession,
    };
  })
);
