import { Context, Layer, Effect, Option } from "effect";
import {
  Blog,
  Article,
  GetArticlesParams,
  Paginated,
  GetBlogPathParams,
  CreateBlogRequest,
  UpdateBlogPathParams,
  UpdateBlogRequest,
  GetArticleParams,
  CreateArticlePathParams,
  CreateArticleRequest,
  UpdateArticlePathParams,
  UpdateArticleRequest,
  DeleteBlogPathParams,
  DeleteArticlePathParams,
  CreateOAuthPathParams,
  OAuthValidationQuery,
  ValidateOAuthPathParams,
} from "@billo-blog/contract";
import { DrizzlePostgresProvider } from "../db/postgres/provider.js";
import { BlogTable, type Session } from "../../db/postgres/schema.js";
import { GitHubService } from "../oauth/github.js";
import { generateState } from "arctic";
import { EnvService } from "../env/service.js";
import { UserService } from "../user/service.js";
import { SessionService, type SessionWithUser } from "../../session/service.js";

export type CreateOAuthResponse = {
  url: URL;
  state: string;
};
export type IBlogService = {
  createOAuth: (
    pathParams: CreateOAuthPathParams
  ) => Effect.Effect<CreateOAuthResponse, Error>;
  validateOAuth: (
    pathParams: ValidateOAuthPathParams,
    query: OAuthValidationQuery
  ) => Effect.Effect<Session, Error>;
  createBlog: (body: CreateBlogRequest) => Effect.Effect<Blog, Error>;
  getBlogs: (query: Paginated) => Effect.Effect<Blog[], Error>;
  getBlog: (pathParams: GetBlogPathParams) => Effect.Effect<Blog, Error>;
  updateBlog: (
    pathParams: UpdateBlogPathParams,
    body: UpdateBlogRequest
  ) => Effect.Effect<Blog, Error>;
  deleteBlog: (pathParams: DeleteBlogPathParams) => Effect.Effect<void, Error>;
  createArticle: (
    pathParams: CreateArticlePathParams,
    body: CreateArticleRequest
  ) => Effect.Effect<Article, Error>;
  getArticles: (
    pathParams: GetArticlesParams,
    query: Paginated
  ) => Effect.Effect<Article[], Error>;
  getArticle: (pathParams: GetArticleParams) => Effect.Effect<Article, Error>;
  updateArticle: (
    pathParams: UpdateArticlePathParams,
    body: UpdateArticleRequest
  ) => Effect.Effect<Article, Error>;
  deleteArticle: (
    pathParams: DeleteArticlePathParams
  ) => Effect.Effect<void, Error>;
};

export class BlogService extends Context.Tag("BlogService")<
  BlogService,
  IBlogService
>() {}

export const BlogServiceLive = Layer.effect(
  BlogService,
  Effect.gen(function* () {
    const { postgresDrizzle } = yield* DrizzlePostgresProvider;
    const { SESSION_SECRET, SESSION_COOKIE_URL, SESSION_COOKIE_SECURE } =
      yield* EnvService;
    const githubService = yield* GitHubService;
    const userService = yield* UserService;
    const sessionService = yield* SessionService;

    const createOAuth: IBlogService["createOAuth"] = (pathParams) =>
      Effect.gen(function* () {
        const state = generateState();
        const url = yield* githubService.createAuthorizationURL(state, [
          "user:email",
        ]);
        return {
          url,
          state,
        };
      });

    const validateOAuth: IBlogService["validateOAuth"] = (pathParams, query) =>
      Effect.gen(function* () {
        yield* Effect.logDebug(`Validating OAuth...`);
        const oauth2Tokens = yield* githubService.validateAuthorizationCode(
          query.code
        );
        yield* Effect.logDebug(`Getting GitHub user...`);
        const githubUser = yield* githubService.getGitHubUser(oauth2Tokens);
        yield* Effect.logDebug(`Getting user by GitHub ID...`);
        const user = yield* userService.getUserByGitHubId(githubUser);
        if (Option.isNone(user)) {
          yield* Effect.logDebug(`User does not exist, creating...`);
          const newUser = yield* userService.createUserFromGitHub(githubUser);
          yield* Effect.logDebug(`Creating session...`);
          const session = yield* sessionService.createSession(newUser.id);
          return session;
        } else {
          yield* Effect.logDebug(`User already exists, creating session...`);
          const session = yield* sessionService.createSession(user.value.id);
          return session;
        }
      });

    const getBlogs: IBlogService["getBlogs"] = (query) =>
      Effect.fail(new Error("Not implemented"));
    const getBlog: IBlogService["getBlog"] = (pathParams) =>
      Effect.fail(new Error("Not implemented"));
    const createBlog: IBlogService["createBlog"] = (body) =>
      Effect.gen(function* () {
        const blog = yield* Effect.tryPromise(() =>
          postgresDrizzle.insert(BlogTable).values({}).returning()
        );
        if (blog.length === 0) {
          return Effect.fail(new Error("Blog not created"));
        } else {
          return Effect.succeed({
            name: blog[0]!.name,
            publicId: blog[0]!.publicId,
            slug: blog[0]!.slug,
            created: blog[0]!.created.toISOString(),
          });
        }
      }).pipe(Effect.flatten);
    const updateBlog: IBlogService["updateBlog"] = (pathParams, body) =>
      Effect.fail(new Error("Not implemented"));
    const deleteBlog: IBlogService["deleteBlog"] = (pathParams) =>
      Effect.fail(new Error("Not implemented"));
    const getArticles: IBlogService["getArticles"] = (pathParams, query) =>
      Effect.fail(new Error("Not implemented"));
    const getArticle: IBlogService["getArticle"] = (pathParams) =>
      Effect.fail(new Error("Not implemented"));
    const createArticle: IBlogService["createArticle"] = (pathParams, body) =>
      Effect.fail(new Error("Not implemented"));
    const updateArticle: IBlogService["updateArticle"] = (pathParams, body) =>
      Effect.fail(new Error("Not implemented"));
    const deleteArticle: IBlogService["deleteArticle"] = (pathParams) =>
      Effect.fail(new Error("Not implemented"));
    return {
      createOAuth,
      validateOAuth,
      getBlogs,
      getBlog,
      createBlog,
      updateBlog,
      deleteBlog,
      getArticles,
      getArticle,
      createArticle,
      updateArticle,
      deleteArticle,
    };
  })
);
