import { Context, Layer, Effect, Option, Either } from "effect";
import {
  Blog,
  Article,
  GetDraftPathParams,
  PaginatedQuery,
  GetBlogPathParams,
  CreateBlogRequest,
  UpdateBlogPathParams,
  UpdateBlogRequest,
  GetDraftVersionsPathParams,
  CreateDraftPathParams,
  CreateDraftRequest,
  UpdateDraftPathParams,
  UpdateDraftRequest,
  DeleteDraftPathParams,
  DeleteArticlePathParams,
  CreateOAuthPathParams,
  OAuthValidationQuery,
  ValidateOAuthPathParams,
  OAuthValidationResponse,
  GetBlogsResponse,
  CreateDraftResponse,
  GetDraftVersionsResponse,
  GetArticlesResponse,
  Block,
  DeleteBlogPathParams,
  GetDraftsPathParams,
  GetDraftsResponse,
  Draft,
  PublishDraftPathParams,
  PublishDraftResponse,
  GetArticlesPathParams,
  GetArticlePathParams,
  CreateApiTokenResponse,
  CreateApiTokenRequest,
  GetApiTokenResponse,
  GetApiTokenPathParams,
  UpdateApiTokenResponse,
  UpdateApiTokenRequest,
  UpdateApiTokenPathParams,
  GetApiTokensResponse,
  RevokeApiTokenPathParams,
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
import * as store from "../store/blog/service.js";
import { addDays } from "date-fns";

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
  createApiToken: (
    body: CreateApiTokenRequest
  ) => Effect.Effect<CreateApiTokenResponse, StandardError, TokenProvider>;
  getApiTokens: (
    query: PaginatedQuery
  ) => Effect.Effect<GetApiTokensResponse, StandardError, TokenProvider>;
  getApiToken: (
    pathParams: GetApiTokenPathParams
  ) => Effect.Effect<
    Option.Option<GetApiTokenResponse>,
    StandardError,
    TokenProvider
  >;
  revokeApiToken: (
    pathParams: RevokeApiTokenPathParams
  ) => Effect.Effect<void, StandardError, TokenProvider>;
  createBlog: (
    body?: CreateBlogRequest
  ) => Effect.Effect<Blog, StandardError, TokenProvider>;
  getBlogs: (
    query: PaginatedQuery
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
  createDraft: (
    pathParams: CreateDraftPathParams,
    body: CreateDraftRequest
  ) => Effect.Effect<CreateDraftResponse, StandardError, TokenProvider>;
  publishDraft: (
    pathParams: PublishDraftPathParams
  ) => Effect.Effect<PublishDraftResponse, StandardError, TokenProvider>;
  getDrafts: (
    pathParams: GetDraftsPathParams,
    query: PaginatedQuery
  ) => Effect.Effect<GetDraftsResponse, StandardError, TokenProvider>;
  getDraft: (
    pathParams: GetDraftPathParams
  ) => Effect.Effect<Option.Option<Draft>, StandardError, TokenProvider>;
  updateDraft: (
    pathParams: UpdateDraftPathParams,
    body: UpdateDraftRequest
  ) => Effect.Effect<Draft, StandardError, TokenProvider>;
  deleteDraft: (
    pathParams: DeleteDraftPathParams
  ) => Effect.Effect<void, StandardError, TokenProvider>;
  deleteArticle: (
    pathParams: DeleteArticlePathParams
  ) => Effect.Effect<void, StandardError, TokenProvider>;
  getArticles: (
    pathParams: GetArticlesPathParams,
    query: PaginatedQuery
  ) => Effect.Effect<GetArticlesResponse, StandardError, TokenProvider>;
  getArticle: (
    pathParams: GetArticlePathParams
  ) => Effect.Effect<Option.Option<Article>, StandardError, TokenProvider>;
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
      const maybeAccessToken = tokenProvider.accessToken;
      yield* Effect.logDebug("Attempting to validate token");

      // Just allow authorised access for the moment
      if (Option.isNone(maybeAccessToken)) {
        yield* Effect.logDebug("No access token provided");
        return Effect.fail(new UnauthorizedError());
      }
      yield* Effect.logDebug("Verifying token");
      const extractedToken = yield* jwtService
        .verifyToken(maybeAccessToken.value)
        .pipe(Effect.either);

      if (Either.isLeft(extractedToken)) {
        yield* Effect.logDebug("Token is invalid");
        return Effect.fail(new UnauthorizedError());
      }
      yield* Effect.logDebug("Getting user by public ID");
      const user = yield* userService.getUserByPublicId(
        extractedToken.right.sub
      );
      if (Option.isNone(user)) {
        yield* Effect.logDebug("User not found");
        return Effect.fail(new UnauthorizedError());
      }
      yield* Effect.logDebug("Validating session token");
      const session = yield* sessionService.validateSessionToken({
        sessionToken: extractedToken.right.jti,
        type: extractedToken.right.type,
      });
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
        const sessionToken = yield* sessionService.createUserSession(
          existingUser.internalId
        );
        const now = new Date();
        const expiresAt = addDays(now, 30);

        const { token, expiresAt: tokenExpiresAt } =
          yield* jwtService.createToken({
            userId: existingUser.id,
            sessionToken: sessionToken,
            type: "user",
            expiresAt: expiresAt.getTime(),
          });
        return {
          accessToken: token,
          expiresAt: tokenExpiresAt,
        };
      });

    const createApiToken: IBlogService["createApiToken"] = (body) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const sessionToken = yield* sessionService.createApiSession({
          name: body.name,
          userId: user.internalId,
          permission: body.permission,
          expiresAt: body.expiresAt,
        });

        const token = yield* jwtService.createToken({
          userId: user.id,
          sessionToken: sessionToken.accessToken,
          type: "api",
          expiresAt: body.expiresAt,
        });
        return {
          accessToken: token.token,
          expiresAt: token.expiresAt,
          tokenId: sessionToken.tokenId,
        };
      });
    const getApiTokens: IBlogService["getApiTokens"] = (query) =>
      Effect.gen(function* () {
        const limit = query.limit ?? 10;
        const page = query.page ?? 0;
        const { user } = yield* requireUser;
        const apiTokens = yield* sessionService.getApiTokens({
          userId: user.internalId,
          limit,
          page,
        });
        return {
          tokens: apiTokens.apiTokens.map((apiToken) => ({
            name: apiToken.name,
            description: apiToken.description,
            permission: apiToken.permission,
            expiresAt: apiToken.expiresAt?.getTime() ?? null,
            tokenId: apiToken.id,
          })),
          limit,
          page,
          count: apiTokens.count,
        };
      });
    const getApiToken: IBlogService["getApiToken"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const apiToken = yield* sessionService.getApiToken({
          userId: user.internalId,
          tokenId: pathParams.tokenId,
        });
        return apiToken.pipe(
          Option.map((apiToken) => ({
            name: apiToken.name,
            description: apiToken.description,
            permission: apiToken.permission,
            expiresAt: apiToken.expiresAt?.getTime() ?? null,
            tokenId: apiToken.id,
          }))
        );
      });

    const revokeApiToken: IBlogService["revokeApiToken"] = (pathParams) =>
      Effect.fail(new Error("Not implemented"));

    const getBlogs: IBlogService["getBlogs"] = (query) =>
      Effect.gen(function* () {
        const limit = query.limit ?? 10;
        const page = query.page ?? 0;
        const { user } = yield* requireUser;
        const { blogs, count } = yield* blogStoreService.getBlogs({
          ownerId: user.internalId,
          page,
          limit,
        });
        return {
          blogs: blogs.map((blog) => ({
            name: blog.name,
            blogId: blog.id,
            slug: blog.slug,
            created: blog.created.toISOString(),
          })),
          count,
          limit,
          page,
        };
      });
    const getBlog: IBlogService["getBlog"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        return blog.pipe(
          Option.map((blog) => ({
            name: blog.name,
            blogId: blog.id,
            slug: blog.slug,
            created: blog.created.toISOString(),
          }))
        );
      });

    const createBlog: IBlogService["createBlog"] = (body) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.createBlog({
          ownerId: user.internalId,
          name: body?.name,
          slug: body?.slug,
        });
        if (Option.isNone(blog)) {
          return Effect.fail(new Error("Blog not created"));
        } else {
          return Effect.succeed({
            name: blog.value.name,
            blogId: blog.value.id,
            slug: blog.value.slug,
            created: blog.value.created.toISOString(),
          });
        }
      }).pipe(Effect.flatten);
    const updateBlog: IBlogService["updateBlog"] = (pathParams, body) =>
      Effect.fail(new Error("Not implemented"));
    const deleteBlog: IBlogService["deleteBlog"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        yield* blogStoreService.deleteBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
      });
    const getDrafts: IBlogService["getDrafts"] = (pathParams, query) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        if (user.internalId !== blog.value.ownerId) {
          return yield* Effect.fail(new UnauthorizedError());
        }
        const { drafts, count, limit, page } =
          yield* blogStoreService.getDrafts({
            blogInternalId: blog.value.internalId,
            page: query.page ?? 0,
            limit: query.limit ?? 10,
          });
        return {
          drafts: drafts.map((draft) => ({
            draftId: draft.id,
            slug: draft.slug,
            name: draft.name,
          })),
          count,
          limit,
          page,
        };
      });
    const getDraft: IBlogService["getDraft"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        if (user.internalId !== blog.value.ownerId) {
          return yield* Effect.fail(new UnauthorizedError());
        }
        const draft = yield* blogStoreService.getDraft({
          blogInternalId: blog.value.internalId,
          id: pathParams.draftId,
        });
        return draft.pipe(
          Option.map((draft) => ({
            draftId: draft.id,
            slug: draft.slug,
            name: draft.name,
            authors: [],
            og: null,
            ogArticle: null,
            blocks: draft.content as Block[],
          }))
        );
      });

    const createDraft: IBlogService["createDraft"] = (pathParams, body) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        if (user.internalId !== blog.value.ownerId) {
          return yield* Effect.fail(new UnauthorizedError());
        }

        const draft = yield* blogStoreService.createDraft({
          blogInternalId: blog.value.internalId,
          name: body?.name,
          slug: body?.slug,
          blocks: body?.blocks,
        });
        if (Option.isNone(draft)) {
          return yield* Effect.fail(new Error("Draft not created"));
        }
        return {
          draftId: draft.value.id,
        };
      });

    const updateDraft: IBlogService["updateDraft"] = (pathParams, body) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        if (user.internalId !== blog.value.ownerId) {
          return yield* Effect.fail(new UnauthorizedError());
        }
        const draft = yield* blogStoreService.updateDraft({
          blogInternalId: blog.value.internalId,
          id: pathParams.draftId,
          blocks: body?.blocks,
          name: body?.name,
          slug: body?.slug,
        });
        if (Option.isNone(draft)) {
          return yield* Effect.fail(new Error("Draft not found"));
        }
        return {
          draftId: draft.value.id,
          slug: draft.value.slug,
          name: draft.value.name,
          authors: [],
          og: null,
          ogArticle: null,
          blocks: draft.value.content,
        };
      });
    const deleteDraft: IBlogService["deleteDraft"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        yield* blogStoreService.deleteDraft({
          blogInternalId: blog.value.internalId,
          draftId: pathParams.draftId,
        });
      });

    const publishDraft: IBlogService["publishDraft"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        if (user.internalId !== blog.value.ownerId) {
          return yield* Effect.fail(new UnauthorizedError());
        }
        const draft = yield* blogStoreService.getDraft({
          blogInternalId: blog.value.internalId,
          id: pathParams.draftId,
        });
        if (Option.isNone(draft)) {
          return yield* Effect.fail(new Error("Draft not found"));
        }
        const article = yield* blogStoreService.upsertArticle({
          id: draft.value.id,
          blogInternalId: blog.value.internalId,
          draftId: draft.value.internalId,
          name: draft.value.name ?? undefined,
          slug: draft.value.slug ?? undefined,
          content: draft.value.content,
          metadata: draft.value.metadata,
        });
        return {
          articleId: article.articleId,
        };
      });

    const deleteArticle: IBlogService["deleteArticle"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        if (user.internalId !== blog.value.ownerId) {
          return yield* Effect.fail(new UnauthorizedError());
        }
        yield* blogStoreService.deleteArticle({
          blogInternalId: blog.value.internalId,
          id: pathParams.articleId,
        });
      });

    const getArticles: IBlogService["getArticles"] = (pathParams, query) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        const { articles, count, limit, page } =
          yield* blogStoreService.getArticles({
            blogInternalId: blog.value.internalId,
            page: query.page ?? 0,
            limit: query.limit ?? 10,
          });
        return {
          articles: articles.map((article: store.GetArticleSummary) => ({
            articleId: article.id,
            name: article.name,
            slug: article.slug,
          })),
          count,
          limit,
          page,
        };
      });
    const getArticle: IBlogService["getArticle"] = (pathParams) =>
      Effect.gen(function* () {
        const { user } = yield* requireUser;
        const blog = yield* blogStoreService.getBlog({
          ownerId: user.internalId,
          id: pathParams.blogId,
        });
        if (Option.isNone(blog)) {
          return yield* Effect.fail(new Error("Blog not found"));
        }
        const article = yield* blogStoreService.getArticle({
          blogInternalId: blog.value.internalId,
          id: pathParams.articleId,
        });
        return article.pipe(
          Option.map((article) => ({
            articleId: article.id,
            name: article.name,
            slug: article.slug,
            // [TODO] Implement
            authors: [],
            og: null,
            ogArticle: null,
            blocks: article.content,
          }))
        );
      });
    return {
      createOAuth,
      validateOAuth,
      createApiToken,
      getApiTokens,
      getApiToken,
      revokeApiToken,
      getBlogs,
      getBlog,
      createBlog,
      updateBlog,
      deleteBlog,
      getDrafts,
      getDraft,
      createDraft,
      updateDraft,
      deleteDraft,
      publishDraft,
      deleteArticle,
      getArticles,
      getArticle,
    };
  })
);
