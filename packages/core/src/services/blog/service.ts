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
  OAuthValidationResponse,
  GetBlogsResponse,
  CreateArticleResponse,
} from "@billo-blog/contract";
import { GitHubService } from "../oauth/github.js";
import { generateState } from "arctic";
import { UserService } from "../user/service.js";
import { SessionService, type SessionWithUser } from "../../session/service.js";
import { JWTService } from "../auth/token.js";
import { TokenProvider } from "../auth/token-provider.js";
import {
  InvalidTokenError,
  TokenExpiredError,
  UnauthorizedError,
} from "../../errors/types.js";
import { BlogStoreService } from "../store/blog/service.js";

export type CreateOAuthResponse = {
  url: URL;
  state: string;
};
export type StandardError =
  | Error
  | UnauthorizedError
  | InvalidTokenError
  | TokenExpiredError;
export type IBlogService = {
  createOAuth: (
    pathParams: CreateOAuthPathParams
  ) => Effect.Effect<CreateOAuthResponse, Error>;
  validateOAuth: (
    pathParams: ValidateOAuthPathParams,
    query: OAuthValidationQuery
  ) => Effect.Effect<OAuthValidationResponse, Error>;
  createBlog: (
    body?: CreateBlogRequest
  ) => Effect.Effect<Blog, StandardError, TokenProvider>;
  getBlogs: (
    query: Paginated
  ) => Effect.Effect<GetBlogsResponse, StandardError, TokenProvider>;
  getBlog: (
    pathParams: GetBlogPathParams
  ) => Effect.Effect<Option.Option<Blog>, StandardError, TokenProvider>;
  updateBlog: (
    pathParams: UpdateBlogPathParams,
    body: UpdateBlogRequest
  ) => Effect.Effect<Blog, StandardError, TokenProvider>;
  deleteBlog: (
    pathParams: DeleteBlogPathParams
  ) => Effect.Effect<void, StandardError, TokenProvider>;
  createArticle: (
    pathParams: CreateArticlePathParams,
    body: CreateArticleRequest
  ) => Effect.Effect<CreateArticleResponse, StandardError, TokenProvider>;
  getArticles: (
    pathParams: GetArticlesParams,
    query: Paginated
  ) => Effect.Effect<Article[], StandardError, TokenProvider>;
  getArticle: (
    pathParams: GetArticleParams
  ) => Effect.Effect<Option.Option<Article>, StandardError, TokenProvider>;
  updateArticle: (
    pathParams: UpdateArticlePathParams,
    body: UpdateArticleRequest
  ) => Effect.Effect<Article, StandardError, TokenProvider>;
  deleteArticle: (
    pathParams: DeleteArticlePathParams
  ) => Effect.Effect<void, StandardError, TokenProvider>;
};

export class BlogService extends Context.Tag("BlogService")<
  BlogService,
  IBlogService
>() {}

export const BlogServiceLive = Layer.effect(
  BlogService,
  Effect.gen(function* () {
    const githubService = yield* GitHubService;
    const userService = yield* UserService;
    const sessionService = yield* SessionService;
    const jwtService = yield* JWTService;
    const blogStoreService = yield* BlogStoreService;

    const requireUser: Effect.Effect<
      SessionWithUser,
      StandardError,
      TokenProvider
    > = Effect.gen(function* () {
      const tokenProvider = yield* TokenProvider;
      yield* Effect.logDebug("Attempting to validate token");
      if (Option.isNone(tokenProvider.accessToken)) {
        yield* Effect.logDebug("No access token provided");
        return Effect.fail(new UnauthorizedError());
      }
      yield* Effect.logDebug("Verifying token");
      const extractedToken = yield* jwtService.verifyToken(
        tokenProvider.accessToken.value
      );

      yield* Effect.logDebug("Getting user by public ID");
      const user = yield* userService.getUserByPublicId(extractedToken.sub);
      if (Option.isNone(user)) {
        yield* Effect.logDebug("User not found");
        return Effect.fail(new UnauthorizedError());
      }
      yield* Effect.logDebug("Validating session token");
      const session = yield* sessionService.validateSessionToken(
        extractedToken.jti
      );
      if (Option.isNone(session)) {
        yield* Effect.logDebug("Session not found");
        return Effect.fail(new UnauthorizedError());
      }
      yield* Effect.logDebug("Session validated");
      return Effect.succeed(session.value);
    }).pipe(Effect.flatten);

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

        const existingUser = yield* Option.isSome(user)
          ? Effect.succeed(user.value)
          : userService.createUserFromGitHub(githubUser);
        const sessionToken = yield* sessionService.createSession(
          existingUser.id
        );

        const token = yield* jwtService.createToken({
          userId: existingUser.publicId,
          sessionToken: sessionToken,
        });
        return {
          accessToken: token.token,
          expiresAt: token.expiresAt,
        };
      });

    const getBlogs: IBlogService["getBlogs"] = (query) =>
      Effect.gen(function* () {
        const { user, session } = yield* requireUser;
        const { blogs, count } = yield* blogStoreService.getBlogs({
          ownerId: user.id,
          page: query.page ?? 0,
          limit: query.limit ?? 10,
        });
        return {
          blogs: blogs.map((blog) => ({
            name: blog.name,
            publicId: blog.publicId,
            slug: blog.slug,
            created: blog.created.toISOString(),
          })),
          count,
          limit: query.limit,
          page: query.page,
        };
      });
    const getBlog: IBlogService["getBlog"] = (pathParams) =>
      Effect.gen(function* () {
        const { user, session } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.id,
          blogPublicId: pathParams.blogId,
        });
        return blog.pipe(
          Option.map((blog) => ({
            name: blog.name,
            publicId: blog.publicId,
            slug: blog.slug,
            created: blog.created.toISOString(),
          }))
        );
      });

    const createBlog: IBlogService["createBlog"] = (body) =>
      Effect.gen(function* () {
        const { user, session } = yield* requireUser;
        const blog = yield* blogStoreService.createBlog({
          ownerId: user.id,
          name: body?.name,
          slug: body?.slug,
        });
        if (Option.isNone(blog)) {
          return Effect.fail(new Error("Blog not created"));
        } else {
          return Effect.succeed({
            name: blog.value.name,
            publicId: blog.value.publicId,
            slug: blog.value.slug,
            created: blog.value.created.toISOString(),
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
      Effect.gen(function* () {
        const { user, session } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.id,
          blogPublicId: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        if (user.id !== blog.value.ownerId) {
          return yield* Effect.fail(new UnauthorizedError());
        }

        const article = yield* blogStoreService.createArticle({
          blogId: blog.value.id,
          name: body?.name,
          slug: body?.slug,
        });
        if (Option.isNone(article)) {
          return yield* Effect.fail(new Error("Article not created"));
        }
        return {
          publicId: article.value.publicId,
        };
      });

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
