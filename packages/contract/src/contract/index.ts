import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { OGArticleSchema, OGBasicSchema } from "../types/opengraph.js";
import { Block } from "../types/blocknote.js";
import { cons } from "effect/List";
export * from "../types/blocknote.js";
const c = initContract();

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
  blogId: ID,
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
  blogId: ID,
});
export type UpdateBlogResponse = z.infer<typeof UpdateBlogResponse>;

export const DeleteBlogPathParams = z.object({
  blogId: ID,
});
export type DeleteBlogPathParams = z.infer<typeof DeleteBlogPathParams>;

export const Blog = z.object({
  blogId: ID,
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

export const CreateDraftPathParams = z.object({
  blogId: ID,
});
export type CreateDraftPathParams = z.infer<typeof CreateDraftPathParams>;

export const CreateDraftRequest = z
  .object({
    name: z.string().optional(),
    slug: z.string().optional(),
    authors: ID.array().optional(),
    og: OGBasicSchema.optional(),
    ogArticle: OGArticleSchema.optional(),
    blocks: z.array(Block).optional(),
  })
  .optional();
export type CreateDraftRequest = z.infer<typeof CreateDraftRequest>;

export const CreateDraftResponse = z.object({
  draftId: ID,
});
export type CreateDraftResponse = z.infer<typeof CreateDraftResponse>;

export const UpdateDraftPathParams = z.object({
  blogId: ID,
  draftId: ID,
});
export type UpdateDraftPathParams = z.infer<typeof UpdateDraftPathParams>;

export const UpdateDraftRequest = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  authors: ID.array().optional(),
  og: OGBasicSchema.optional(),
  ogArticle: OGArticleSchema.optional(),
  blocks: z.array(Block).optional(),
});
export type UpdateDraftRequest = z.infer<typeof UpdateDraftRequest>;

export const UpdateDraftResponse = z.object({
  draftId: ID,
});
export type UpdateDraftResponse = z.infer<typeof UpdateDraftResponse>;

export const DeleteDraftPathParams = z.object({
  blogId: ID,
  draftId: ID,
});
export type DeleteDraftPathParams = z.infer<typeof DeleteDraftPathParams>;

export const Draft = z.object({
  draftId: ID,
  slug: z.string().nullable(),
  name: z.string().nullable(),
  authors: z.array(ID),
  og: OGBasicSchema.nullable(),
  ogArticle: OGArticleSchema.nullable(),
  blocks: z.array(Block),
});
export type Draft = z.infer<typeof Draft>;

export const Article = z.object({
  articleId: ID,
  name: z.string(),
  slug: z.string(),
  authors: ID.array(),
  og: OGBasicSchema.nullable(),
  ogArticle: OGArticleSchema.nullable(),
  blocks: z.array(Block),
});
export type Article = z.infer<typeof Article>;

export const GetDraftsPathParams = z.object({
  blogId: ID,
});
export type GetDraftsPathParams = z.infer<typeof GetDraftsPathParams>;

export const DraftSummary = z.object({
  draftId: ID,
  slug: z.string().nullable(),
  name: z.string().nullable(),
});
export type DraftSummary = z.infer<typeof DraftSummary>;

export const GetDraftsResponse = PaginatedAndCounted.merge(
  z.object({
    drafts: z.array(DraftSummary),
  })
);
export type GetDraftsResponse = z.infer<typeof GetDraftsResponse>;
export const GetDraftPathParams = z.object({
  blogId: ID,
  draftId: ID,
});
export type GetDraftPathParams = z.infer<typeof GetDraftPathParams>;

export const GetDraftVersionsPathParams = z.object({
  blogId: ID,
  draftId: ID,
});
export type GetDraftVersionsPathParams = z.infer<
  typeof GetDraftVersionsPathParams
>;

export const DraftVersion = z.object({
  publishedAt: z.string(),
  version: z.number(),
  draftId: ID,
});
export type DraftVersion = z.infer<typeof DraftVersion>;

export const GetDraftVersionsResponse = PaginatedAndCounted.merge(
  z.object({
    versions: z.array(DraftVersion),
  })
);
export type GetDraftVersionsResponse = z.infer<typeof GetDraftVersionsResponse>;

export const PublishDraftPathParams = z.object({
  blogId: ID,
  draftId: ID,
});
export type PublishDraftPathParams = z.infer<typeof PublishDraftPathParams>;

export const PublishDraftResponse = z.object({
  articleId: ID,
});
export type PublishDraftResponse = z.infer<typeof PublishDraftResponse>;

export const DeleteArticlePathParams = z.object({
  blogId: ID,
  articleId: ID,
});
export type DeleteArticlePathParams = z.infer<typeof DeleteArticlePathParams>;

export const DeleteArticleResponse = z.object({
  articleId: ID,
});
export type DeleteArticleResponse = z.infer<typeof DeleteArticleResponse>;

export const GetArticlesPathParams = z.object({
  blogId: ID,
});
export type GetArticlesPathParams = z.infer<typeof GetArticlesPathParams>;

export const GetArticlesResponse = PaginatedAndCounted.merge(
  z.object({
    articles: z.array(Article),
  })
);
export type GetArticlesResponse = z.infer<typeof GetArticlesResponse>;

export const GetArticlePathParams = z.object({
  blogId: ID,
  articleId: ID,
});
export type GetArticlePathParams = z.infer<typeof GetArticlePathParams>;

export const GetArticleResponse = Article;
export type GetArticleResponse = z.infer<typeof GetArticleResponse>;

export const GetArticleVersionsPathParams = z.object({
  blogId: ID,
  articleId: ID,
});
/*
// Draft Operations
POST    /api/blogs/{blogId}/drafts              // Create new draft
GET     /api/blogs/{blogId}/drafts              // List all drafts
GET     /api/blogs/{blogId}/drafts/{draftId}    // Get specific draft
PUT     /api/blogs/{blogId}/drafts/{draftId}    // Update draft
DELETE  /api/blogs/{blogId}/drafts/{draftId}    // Delete draft

// Publishing Operations
POST    /api/blogs/{blogId}/drafts/{draftId}/publish    // Publish a draft
DELETE  /api/blogs/{blogId}/articles/{articleId}        // Unpublish an article

// Published Articles
GET     /api/blogs/{blogId}/articles            // List published articles
GET     /api/blogs/{blogId}/articles/{articleId}        // Get published article
GET     /api/blogs/{blogId}/articles/{articleId}/versions  // Get publishing history
*/

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
    createDraft: {
      method: "POST",
      path: "/blogs/:blogId/drafts",
      pathParams: CreateDraftPathParams,
      body: CreateDraftRequest,
      responses: {
        200: CreateDraftResponse,
      },
    },
    getDrafts: {
      method: "GET",
      path: "/blogs/:blogId/drafts",
      pathParams: GetDraftsPathParams,
      query: Paginated,
      responses: {
        200: GetDraftsResponse,
      },
    },
    getDraft: {
      method: "GET",
      path: "/blogs/:blogId/drafts/:draftId",
      pathParams: GetDraftPathParams,
      responses: {
        200: Draft,
        404: z.any(),
      },
    },
    updateDraft: {
      method: "PUT",
      path: "/blogs/:blogId/drafts/:draftId",
      pathParams: UpdateDraftPathParams,
      body: UpdateDraftRequest,
      responses: {
        200: UpdateDraftResponse,
      },
    },
    deleteDraft: {
      method: "DELETE",
      path: "/blogs/:blogId/drafts/:draftId",
      pathParams: DeleteDraftPathParams,
      responses: {
        200: z.any(),
      },
    },
    getDraftVersions: {
      method: "GET",
      path: "/blogs/:blogId/drafts/:draftId/versions",
      pathParams: GetDraftVersionsPathParams,
      query: Paginated,
      responses: {
        200: GetDraftVersionsResponse,
      },
    },
    publishDraft: {
      method: "POST",
      path: "/blogs/:blogId/drafts/:draftId/publish",
      pathParams: PublishDraftPathParams,
      body: z.any().optional(),
      responses: {
        200: PublishDraftResponse,
      },
    },
    deleteArticle: {
      method: "DELETE",
      path: "/blogs/:blogId/articles/:articleId",
      pathParams: DeleteArticlePathParams,
      responses: {
        200: DeleteArticleResponse,
      },
    },
    getArticles: {
      method: "GET",
      path: "/blogs/:blogId/articles",
      pathParams: GetArticlesPathParams,
      query: Paginated,
      responses: {
        200: GetArticlesResponse,
      },
    },
    getArticle: {
      method: "GET",
      path: "/blogs/:blogId/articles/:articleId",
      pathParams: GetArticlePathParams,
      responses: {
        200: GetArticleResponse,
      },
    },
  },
  {
    pathPrefix: "/v1",
  }
);
