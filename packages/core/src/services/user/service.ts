import { Context, Effect, Layer, Option } from "effect";

import { eq, and } from "drizzle-orm";
import {
  OAuthAccountTable,
  UserTable,
  type User,
} from "../../db/postgres/schema.js";
import type { GitHubUser } from "../oauth/github.js";
import { DrizzlePostgresProvider } from "../db/postgres/provider.js";

export type IUserService = {
  getUserById: (userId: number) => Effect.Effect<User, Error>;
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
      Effect.tryPromise(async () => {
        const user = await postgresDrizzle
          .select()
          .from(UserTable)
          .where(eq(UserTable.id, userId))
          .limit(1);
        if (!user || user.length == 0) {
          return Effect.fail(new Error("User not found"));
        }
        return Effect.succeed(user[0]!);
      }).pipe(Effect.flatten);

    const getUserByGitHubId: IUserService["getUserByGitHubId"] = (githubUser) =>
      Effect.tryPromise(async () => {
        const user = await postgresDrizzle
          .select({
            user: UserTable,
            oauthAccount: OAuthAccountTable,
          })
          .from(UserTable)
          .innerJoin(
            OAuthAccountTable,
            eq(UserTable.id, OAuthAccountTable.userId)
          )
          .where(
            and(
              eq(OAuthAccountTable.provider, "github"),
              eq(OAuthAccountTable.providerAccountId, githubUser.id)
            )
          )
          .execute();

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
        if (!email) {
          return Effect.fail(new Error("Email is required"));
        }
        const user = yield* Effect.tryPromise(() =>
          postgresDrizzle.transaction(async (tx) => {
            // Insert into UserTable
            const [user] = await tx
              .insert(UserTable)
              .values({
                email: email,
                emailVerified: true, // Assuming LinkedIn provides verified emails
              })
              .returning();

            // Insert into OAuthAccountTable
            await tx.insert(OAuthAccountTable).values({
              userId: user!.id,
              provider: "github",
              providerAccountId: githubUser.id,
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
      getUserByGitHubId,
      createUserFromGitHub,
    };
  })
);
