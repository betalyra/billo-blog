import type { Effect } from "effect";
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
} from "@billo-blog/contract";

export type IBlogService = {
  getBlogs: (query: Paginated) => Effect.Effect<Blog[], never>;
  getBlog: (pathParams: GetBlogPathParams) => Effect.Effect<Blog, never>;
  createBlog: (body: CreateBlogRequest) => Effect.Effect<Blog, never>;
  updateBlog: (
    pathParams: UpdateBlogPathParams,
    body: UpdateBlogRequest
  ) => Effect.Effect<Blog, never>;
  getArticles: (
    pathParams: GetArticlesParams,
    query: Paginated
  ) => Effect.Effect<Article[], never>;
  getArticle: (pathParams: GetArticleParams) => Effect.Effect<Article, never>;
  createArticle: (
    pathParams: CreateArticlePathParams,
    body: CreateArticleRequest
  ) => Effect.Effect<Article, never>;
  updateArticle: (
    pathParams: UpdateArticlePathParams,
    body: UpdateArticleRequest
  ) => Effect.Effect<Article, never>;
};
