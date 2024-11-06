import { Context, Effect, Layer, Option } from "effect";

import { eq, and } from "drizzle-orm";
import {
  OAuthAccountsTable,
  UsersTable,
  type User,
} from "../../db/postgres/schema.js";
import type { GitHubUser } from "../oauth/github.js";
import { DrizzlePostgresProvider } from "../db/postgres/provider.js";

export type IUserService = {
  getUserById: (userId: number) => Effect.Effect<Option.Option<User>, Error>;
  getUserByPublicId: (
    publicId: string
  ) => Effect.Effect<Option.Option<User>, Error>;
  getUserByGitHubId(
    gitHubUser: GitHubUser
  ): Effect.Effect<Option.Option<User>, Error>;
  createUserFromGitHub(gitHubUser: GitHubUser): Effect.Effect<User, Error>;
};

export class UserService extends Context.Tag("UserService")<
  UserService,
  IUserService
>() {}

export const UserServiceLive = Layer.effect(
  UserService,
  Effect.gen(function* () {
    const { postgresDrizzle } = yield* DrizzlePostgresProvider;

    const getUserById: IUserService["getUserById"] = (userId) =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Getting user by ID: ${userId}`);
        const user = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(UsersTable)
            .where(eq(UsersTable.internalId, userId))
            .limit(1)
        );
        yield* Effect.logDebug(`Got user.`);
        if (!user || user.length == 0) {
          return Effect.succeed(Option.none());
        }
        return Effect.succeed(Option.some(user[0]!));
      }).pipe(Effect.flatten);

    const getUserByPublicId: IUserService["getUserByPublicId"] = (publicId) =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Getting user by public ID: ${publicId}`);
        const user = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(UsersTable)
            .where(eq(UsersTable.id, publicId))
            .limit(1)
        );
        yield* Effect.logDebug(`Got user.`);
        if (!user || user.length == 0) {
          return Effect.succeed(Option.none());
        }
        return Effect.succeed(Option.some(user[0]!));
      }).pipe(Effect.flatten);

    const getUserByGitHubId: IUserService["getUserByGitHubId"] = (githubUser) =>
      Effect.gen(function* () {
        yield* Effect.logDebug(
          `Getting user by GitHub ID: ${githubUser.id.toString()}`
        );
        const user = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select({
              user: UsersTable,
              oauthAccount: OAuthAccountsTable,
            })
            .from(UsersTable)
            .innerJoin(
              OAuthAccountsTable,
              eq(UsersTable.internalId, OAuthAccountsTable.userId)
            )
            .where(
              and(
                eq(OAuthAccountsTable.provider, "github"),
                eq(
                  OAuthAccountsTable.providerAccountId,
                  githubUser.id.toString()
                )
              )
            )
            .execute()
        );
        yield* Effect.logDebug(`Got user.`);
        if (!user || user.length == 0) {
          return Effect.succeed(Option.none());
        }
        return Effect.succeed(Option.some(user[0]!.user));
      }).pipe(Effect.flatten);

    const createUserFromGitHub: IUserService["createUserFromGitHub"] = (
      githubUser
    ) =>
      Effect.gen(function* () {
        const email = githubUser.email;
        const user = yield* Effect.tryPromise(() =>
          postgresDrizzle.transaction(async (tx) => {
            // Insert into UserTable
            const [user] = await tx
              .insert(UsersTable)
              .values({
                email: email,
                emailVerified: false,
                lastSignInAt: new Date(),
              })
              .returning();

            // Insert into OAuthAccountTable
            await tx.insert(OAuthAccountsTable).values({
              userId: user!.internalId,
              provider: "github",
              providerAccountId: githubUser.id.toString(),
            });

            return user;
          })
        );

        if (!user) {
          return Effect.fail(new Error("User not found"));
        }
        return Effect.succeed(user);
      }).pipe(Effect.flatten);

    return {
      getUserById,
      getUserByPublicId,
      getUserByGitHubId,
      createUserFromGitHub,
    };
  })
);
