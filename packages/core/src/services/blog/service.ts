import { Context, Layer, Effect } from "effect";
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
import { BlogTable, type User } from "../../db/postgres/schema.js";
import { GitHubService } from "../oauth/github.js";
import { generateState } from "arctic";
import Cookies from "js-cookie";
import { EnvService } from "../env/service.js";

export type IBlogService = {
  createOAuth: (pathParams: CreateOAuthPathParams) => Effect.Effect<URL, Error>;
  validateOAuth: (
    pathParams: ValidateOAuthPathParams,
    query: OAuthValidationQuery
  ) => Effect.Effect<void, Error>;
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
    const { createAuthorizationURL, validateAuthorizationCode } =
      yield* GitHubService;

    const createOAuth: IBlogService["createOAuth"] = (pathParams) =>
      Effect.gen(function* () {
        const state = generateState();
        const url = yield* createAuthorizationURL("state", ["user:email"]);
        // {
        //     name: SESSION_COOKIE_NAME,
        //     domain: SITE_URL.split("://")[1],
        //     httpOnly: true,
        //     maxAge: 60 * 60 * 24 * 30, // 30 days
        //     path: "/",
        //     sameSite: "lax",
        //     secrets: [SESSION_SECRET],
        //     secure: process.env.NODE_ENV === "production",
        //   },
        Cookies.set("state", state, {
          domain: SESSION_COOKIE_URL.split("://")[1],
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: "/",
          sameSite: "lax",
          secure: SESSION_COOKIE_SECURE,
        });

        return url;
      });
    const validateOAuth: IBlogService["validateOAuth"] = (pathParams, query) =>
      Effect.gen(function* () {
        const validation = yield* validateAuthorizationCode(query.code);

        return;
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
