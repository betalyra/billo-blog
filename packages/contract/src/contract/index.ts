import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { OGArticleSchema, OGBasicSchema } from "../types/opengraph.js";
import { Block } from "../types/blocknote.js";
import { cons } from "effect/List";
export * from "../types/blocknote.js";
const c = initContract();

export const ID = z.string().cuid2();
export type ID = z.infer<typeof ID>;

export const Paginated = z.object({
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
});

export type Paginated = z.infer<typeof Paginated>;

export const Counted = z.object({
  count: z.number(),
});

export type Counted = z.infer<typeof Counted>;

export const PaginatedAndCounted = Paginated.merge(Counted);
export type PaginatedAndCounted = z.infer<typeof PaginatedAndCounted>;

export const CreateBlogRequest = z
  .object({
    name: z.string().optional(),
    slug: z.string().optional(),
  })
  .optional();
export type CreateBlogRequest = z.infer<typeof CreateBlogRequest>;

export const CreateBlogResponse = z.object({
  publicId: ID,
});
export type CreateBlogResponse = z.infer<typeof CreateBlogResponse>;

export const UpdateBlogPathParams = z.object({
  blogId: ID,
});
export type UpdateBlogPathParams = z.infer<typeof UpdateBlogPathParams>;

export const UpdateBlogRequest = z.object({
  name: z.string().nullable(),
});
export type UpdateBlogRequest = z.infer<typeof UpdateBlogRequest>;

export const UpdateBlogResponse = z.object({
  publicId: ID,
});
export type UpdateBlogResponse = z.infer<typeof UpdateBlogResponse>;

export const DeleteBlogPathParams = z.object({
  blogId: ID,
});
export type DeleteBlogPathParams = z.infer<typeof DeleteBlogPathParams>;

export const Blog = z.object({
  publicId: ID,
  slug: z.string().nullable(),
  name: z.string().nullable(),
  created: z.string(),
});
export type Blog = z.infer<typeof Blog>;

export const GetBlogPathParams = z.object({
  blogId: ID,
});
export type GetBlogPathParams = z.infer<typeof GetBlogPathParams>;

export const GetBlogsResponse = PaginatedAndCounted.merge(
  z.object({
    blogs: z.array(Blog),
  })
);
export type GetBlogsResponse = z.infer<typeof GetBlogsResponse>;

export const CreateArticlePathParams = z.object({
  blogId: ID,
});
export type CreateArticlePathParams = z.infer<typeof CreateArticlePathParams>;

export const CreateArticleRequest = z
  .object({
    name: z.string().optional(),
    slug: z.string().optional(),
    authors: ID.array().optional(),
    og: OGBasicSchema.optional(),
    ogArticle: OGArticleSchema.optional(),
    blocks: z.array(Block).optional(),
  })
  .optional();
export type CreateArticleRequest = z.infer<typeof CreateArticleRequest>;

export const CreateArticleResponse = z.object({
  publicId: ID,
});
export type CreateArticleResponse = z.infer<typeof CreateArticleResponse>;

export const UpdateArticlePathParams = z.object({
  blogId: ID,
  articleId: ID,
});
export type UpdateArticlePathParams = z.infer<typeof UpdateArticlePathParams>;

export const UpdateArticleRequest = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  authors: ID.array().optional(),
  og: OGBasicSchema.optional(),
  ogArticle: OGArticleSchema.optional(),
  blocks: z.array(Block).optional(),
});
export type UpdateArticleRequest = z.infer<typeof UpdateArticleRequest>;

export const UpdateArticleResponse = z.object({
  publicId: ID,
});
export type UpdateArticleResponse = z.infer<typeof UpdateArticleResponse>;

export const DeleteArticlePathParams = z.object({
  blogId: ID,
  articleId: ID,
});
export type DeleteArticlePathParams = z.infer<typeof DeleteArticlePathParams>;

export const Article = z.object({
  publicId: ID,
  slug: z.string().nullable(),
  authors: z.array(ID),
  og: OGBasicSchema.nullable(),
  ogArticle: OGArticleSchema.nullable(),
  blocks: z.array(Block),
});
export type Article = z.infer<typeof Article>;

export const GetArticlesParams = z.object({
  blogId: ID,
});
export type GetArticlesParams = z.infer<typeof GetArticlesParams>;

export const GetArticlesResponse = PaginatedAndCounted.merge(
  z.object({
    articles: z.array(Article),
  })
);

export const GetArticleParams = z.object({
  blogId: ID,
  articleId: ID,
});
export type GetArticleParams = z.infer<typeof GetArticleParams>;

export const CreateOAuthPathParams = z.object({
  provider: z.enum(["github"]),
});
export type CreateOAuthPathParams = z.infer<typeof CreateOAuthPathParams>;

export const ValidateOAuthPathParams = CreateOAuthPathParams;
export type ValidateOAuthPathParams = z.infer<typeof ValidateOAuthPathParams>;

export const OAuthValidationQuery = z.object({
  code: z.string(),
  state: z.string(),
});
export type OAuthValidationQuery = z.infer<typeof OAuthValidationQuery>;

export const OAuthValidationResponse = z.object({
  accessToken: z.string(),
  expiresAt: z.number(),
});
export type OAuthValidationResponse = z.infer<typeof OAuthValidationResponse>;

export const billoblogContract = c.router(
  {
    createOAuth: {
      method: "GET",
      path: "/login/oauth/:provider",
      pathParams: CreateOAuthPathParams,
      responses: {
        302: z.any(),
        404: z.any(),
      },
    },
    validateOAuth: {
      method: "GET",
      path: "/login/oauth/:provider/validate",
      pathParams: ValidateOAuthPathParams,
      query: OAuthValidationQuery,
      responses: {
        200: OAuthValidationResponse,
        401: z.any(),
      },
    },
    createBlog: {
      method: "POST",
      path: "/blogs",
      body: CreateBlogRequest,
      responses: {
        200: CreateBlogResponse,
      },
    },
    getBlogs: {
      method: "GET",
      path: "/blogs",
      query: Paginated,
      responses: {
        200: GetBlogsResponse,
      },
    },
    getBlog: {
      method: "GET",
      path: "/blogs/:blogId",
      pathParams: GetBlogPathParams,
      responses: {
        200: Blog,
        404: z.any(),
      },
    },
    updateBlog: {
      method: "PUT",
      path: "/blogs/:blogId",
      pathParams: UpdateBlogPathParams,
      body: UpdateBlogRequest,
      responses: {
        200: UpdateBlogResponse,
      },
    },
    deleteBlog: {
      method: "DELETE",
      path: "/blogs/:blogId",
      pathParams: DeleteBlogPathParams,
      responses: {
        200: z.any(),
      },
    },
    createArticle: {
      method: "POST",
      path: "/blogs/:blogId/articles",
      pathParams: CreateArticlePathParams,
      body: CreateArticleRequest,
      responses: {
        200: CreateArticleResponse,
      },
    },
    getArticles: {
      method: "GET",
      path: "/blogs/:blogId/articles",
      pathParams: GetArticlesParams,
      query: Paginated,
      responses: {
        200: GetArticlesResponse,
      },
    },
    getArticle: {
      method: "GET",
      path: "/blogs/:blogId/articles/:articleId",
      pathParams: GetArticleParams,
      responses: {
        200: Article,
        404: z.any(),
      },
    },
    updateArticle: {
      method: "PUT",
      path: "/blogs/:blogId/articles/:articleId",
      pathParams: UpdateArticlePathParams,
      body: UpdateArticleRequest,
      responses: {
        200: UpdateArticleResponse,
      },
    },
    deleteArticle: {
      method: "DELETE",
      path: "/blogs/:blogId/articles/:articleId",
      pathParams: DeleteArticlePathParams,
      responses: {
        200: z.any(),
      },
    },
  },
  {
    pathPrefix: "/v1",
  }
);
