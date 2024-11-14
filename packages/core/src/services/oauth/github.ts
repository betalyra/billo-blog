import { GitHub, OAuth2Tokens } from "arctic";
import { Context, Effect, Layer } from "effect";
import { z } from "zod";
import { EnvService } from "../env/service.js";

export const GitHubUser = z.object({
  id: z.number(),
  login: z.string(),
  email: z.string().nullish(),
});

export type GitHubUser = z.infer<typeof GitHubUser>;

export type IGitHubService = {
  createAuthorizationURL(
    state: string,
    scopes?: string[]
  ): Effect.Effect<URL, Error>;
  validateAuthorizationCode(code: string): Effect.Effect<OAuth2Tokens, Error>;
  getGitHubUser(tokens: OAuth2Tokens): Effect.Effect<GitHubUser, Error>;
};
export class GitHubService extends Context.Tag("GitHubService")<
  GitHubService,
  IGitHubService
>() {}

export const GitHubServiceLive = Layer.effect(
  GitHubService,
  Effect.gen(function* () {
    const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_REDIRECT_URI } =
      yield* EnvService;
    const github = new GitHub(
      GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET,
      GITHUB_REDIRECT_URI
    );
    const createAuthorizationURL: IGitHubService["createAuthorizationURL"] = (
      state,
      scopes
    ) => Effect.sync(() => github.createAuthorizationURL(state, scopes ?? []));

    const validateAuthorizationCode: IGitHubService["validateAuthorizationCode"] =
      (code) => Effect.tryPromise(() => github.validateAuthorizationCode(code));

    const getGitHubUser: IGitHubService["getGitHubUser"] = (tokens) =>
      Effect.gen(function* () {
        yield* Effect.logInfo(`Getting GitHub user.`);
        const result = yield* Effect.tryPromise((signal) =>
          fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${tokens.accessToken()}`,
            },
            signal,
          })
        );
        yield* Effect.logDebug(`Got GitHub user.`);

        if (result.ok) {
          const json = yield* Effect.tryPromise(() => result.json());
          const parsedGitHubUser = GitHubUser.safeParse(json);
          if (parsedGitHubUser.success) {
            return Effect.succeed(parsedGitHubUser.data);
          } else {
            yield* Effect.logError(
              `Invalid GitHub response. ${parsedGitHubUser.error}`
            );
            return Effect.fail(
              new Error(`Invalid GitHub response. ${parsedGitHubUser.error}`)
            );
          }
        } else {
          yield* Effect.logError(
            `Failed to get GitHub user. ${result.statusText}`
          );
          return Effect.fail(new Error(`Failed to get GitHub user.`));
        }
      }).pipe(Effect.flatten);
    return {
      createAuthorizationURL,
      validateAuthorizationCode,
      getGitHubUser,
    };
  })
);
