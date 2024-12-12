import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { OGArticleSchema, OGBasicSchema } from "../types/opengraph.js";
import { Block } from "../types/blocknote.js";
import { LanguageTag } from "../types/base.js";
export * from "../types/blocknote.js";

const c = initContract();

export const ID = z.string().cuid2();
export type ID = z.infer<typeof ID>;

export const PaginatedQuery = z.object({
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
});

export type PaginatedQuery = z.infer<typeof PaginatedQuery>;

export const Counted = z.object({
  count: z.number(),
});

export const PaginatedResponse = z.object({
  limit: z.number(),
  page: z.number(),
});
export type PaginatedResponse = z.infer<typeof PaginatedResponse>;

export type Counted = z.infer<typeof Counted>;

export const PaginatedAndCounted = PaginatedResponse.merge(Counted);
export type PaginatedAndCounted = z.infer<typeof PaginatedAndCounted>;

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
  expiresAt: z.number().optional(),
});
export type OAuthValidationResponse = z.infer<typeof OAuthValidationResponse>;

export const CreateApiTokenRequest = z.object({
  name: z.string(),
  description: z.string().optional(),
  permission: z.enum(["read", "write"]).optional().default("read"),
  expiresAt: z.number().optional(),
});
export type CreateApiTokenRequest = z.infer<typeof CreateApiTokenRequest>;

export const CreateApiTokenResponse = z.object({
  accessToken: z.string(),
  expiresAt: z.number().optional(),
  tokenId: ID,
});
export type CreateApiTokenResponse = z.infer<typeof CreateApiTokenResponse>;

export const UpdateApiTokenPathParams = z.object({
  tokenId: ID,
});
export type UpdateApiTokenPathParams = z.infer<typeof UpdateApiTokenPathParams>;

export const UpdateApiTokenRequest = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  permission: z.enum(["read", "write"]).optional(),
  expiresAt: z.number().optional(),
});
export type UpdateApiTokenRequest = z.infer<typeof UpdateApiTokenRequest>;

export const UpdateApiTokenResponse = z.object({
  tokenId: ID,
});
export type UpdateApiTokenResponse = z.infer<typeof UpdateApiTokenResponse>;

export const GetApiTokenPathParams = z.object({
  tokenId: ID,
});
export type GetApiTokenPathParams = z.infer<typeof GetApiTokenPathParams>;

export const GetApiTokenResponse = z.object({
  tokenId: ID,
  name: z.string(),
  description: z.string().nullable(),
  permission: z.enum(["read", "write"]),
  expiresAt: z.number().nullable(),
});
export type GetApiTokenResponse = z.infer<typeof GetApiTokenResponse>;

export const GetApiTokensQuery = PaginatedQuery;
export type GetApiTokensQuery = z.infer<typeof GetApiTokensQuery>;

export const GetApiTokensResponse = PaginatedAndCounted.merge(
  z.object({
    tokens: z.array(GetApiTokenResponse),
  })
);
export type GetApiTokensResponse = z.infer<typeof GetApiTokensResponse>;

export const RevokeApiTokenPathParams = z.object({
  tokenId: ID,
});
export type RevokeApiTokenPathParams = z.infer<typeof RevokeApiTokenPathParams>;

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

export const Variant = z.object({
  lang: LanguageTag.optional(),
  abTest: z.string().optional(),
  format: z.string().optional(),
  audience: z.string().optional(),
  region: z.string().optional(),
});
export type Variant = z.infer<typeof Variant>;

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
    variant: Variant.optional(),
  })
  .optional();
export type CreateDraftRequest = z.infer<typeof CreateDraftRequest>;

export const CreateDraftResponse = z.object({
  draftId: ID,
});
export type CreateDraftResponse = z.infer<typeof CreateDraftResponse>;

export const CreateDraftVariantPathParams = z.object({
  blogId: ID,
  draftId: ID,
});
export type CreateDraftVariantPathParams = z.infer<
  typeof CreateDraftVariantPathParams
>;

export const CreateDraftVariantRequest = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  authors: ID.array().optional(),
  og: OGBasicSchema.optional(),
  ogArticle: OGArticleSchema.optional(),
  blocks: z.array(Block).optional(),
  variant: Variant.optional(),
});
export type CreateDraftVariantRequest = z.infer<
  typeof CreateDraftVariantRequest
>;

export const CreateDraftVariantResponse = z.object({
  draftId: ID,
});
export type CreateDraftVariantResponse = z.infer<
  typeof CreateDraftVariantResponse
>;

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
  variant: Variant.nullable(),
});
export type Draft = z.infer<typeof Draft>;

export const Article = z.object({
  articleId: ID,
  name: z.string().nullable(),
  slug: z.string().nullable(),
  authors: ID.array().nullable(),
  og: OGBasicSchema.nullable(),
  ogArticle: OGArticleSchema.nullable(),
  blocks: z.array(Block).nullable(),
  variant: Variant.nullable(),
});
export type Article = z.infer<typeof Article>;

export const GetDraftsPathParams = z.object({
  blogId: ID,
});
export type GetDraftsPathParams = z.infer<typeof GetDraftsPathParams>;

export const GetDraftsQuery = PaginatedQuery.merge(Variant);
export type GetDraftsQuery = z.infer<typeof GetDraftsQuery>;

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

export const GetDraftQuery = Variant;
export type GetDraftQuery = z.infer<typeof GetDraftQuery>;

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
export const GetDraftVariantsPathParams = z.object({
  blogId: ID,
  draftId: ID,
});
export type GetDraftVariantsPathParams = z.infer<
  typeof GetDraftVariantsPathParams
>;
export const GetDraftVariantsResponse = PaginatedAndCounted.merge(
  z.object({
    variants: z.array(Draft),
  })
);
export type GetDraftVariantsResponse = z.infer<typeof GetDraftVariantsResponse>;

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

export const GetArticlesPathParams = z.object({
  blogId: ID,
});
export type GetArticlesPathParams = z.infer<typeof GetArticlesPathParams>;

export const ArticleSummary = z.object({
  articleId: ID,
  name: z.string().nullable(),
  slug: z.string().nullable(),
});
export type ArticleSummary = z.infer<typeof ArticleSummary>;

export const GetArticlesResponse = PaginatedAndCounted.merge(
  z.object({
    articles: z.array(ArticleSummary),
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
export type GetArticleVersionsPathParams = z.infer<
  typeof GetArticleVersionsPathParams
>;

export const GetArticleVariantsPathParams = z.object({
  blogId: ID,
  articleId: ID,
});
export type GetArticleVariantsPathParams = z.infer<
  typeof GetArticleVariantsPathParams
>;

export const GetArticleVariantsResponse = PaginatedAndCounted.merge(
  z.object({
    variants: z.array(Article),
  })
);
export type GetArticleVariantsResponse = z.infer<
  typeof GetArticleVariantsResponse
>;

export const ErrorResponse = z.object({
  status: z.number(),
  message: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;

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
    createApiToken: {
      method: "POST",
      path: "/tokens",
      body: CreateApiTokenRequest,
      responses: {
        200: CreateApiTokenResponse,
      },
    },
    getApiTokens: {
      method: "GET",
      path: "/tokens",
      query: GetApiTokensQuery,
      responses: {
        200: GetApiTokensResponse,
      },
    },
    getApiToken: {
      method: "GET",
      path: "/tokens/:tokenId",
      pathParams: GetApiTokenPathParams,
      responses: {
        200: GetApiTokenResponse,
      },
    },
    revokeApiToken: {
      method: "DELETE",
      path: "/tokens/:tokenId",
      pathParams: RevokeApiTokenPathParams,
      responses: {
        200: z.any(),
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
      query: PaginatedQuery,
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
    createDraftVariant: {
      method: "POST",
      path: "/blogs/:blogId/drafts/:draftId/variants",
      pathParams: CreateDraftVariantPathParams,
      body: CreateDraftVariantRequest,
      responses: {
        200: CreateDraftVariantResponse,
        409: ErrorResponse,
      },
    },
    getDrafts: {
      method: "GET",
      path: "/blogs/:blogId/drafts",
      pathParams: GetDraftsPathParams,
      query: GetDraftsQuery,
      responses: {
        200: GetDraftsResponse,
      },
    },
    getDraft: {
      method: "GET",
      path: "/blogs/:blogId/drafts/:draftId",
      pathParams: GetDraftPathParams,
      query: GetDraftQuery,
      responses: {
        200: Draft,
        404: z.void(),
      },
    },
    updateDraft: {
      method: "PUT",
      path: "/blogs/:blogId/drafts/:draftId",
      pathParams: UpdateDraftPathParams,
      query: Variant,
      body: UpdateDraftRequest,
      responses: {
        200: UpdateDraftResponse,
      },
    },
    deleteDraft: {
      method: "DELETE",
      path: "/blogs/:blogId/drafts/:draftId",
      pathParams: DeleteDraftPathParams,
      query: Variant,
      responses: {
        200: z.void(),
      },
    },
    getDraftVersions: {
      method: "GET",
      path: "/blogs/:blogId/drafts/:draftId/versions",
      pathParams: GetDraftVersionsPathParams,
      query: PaginatedQuery,
      responses: {
        200: GetDraftVersionsResponse,
      },
    },
    getDraftVariants: {
      method: "GET",
      path: "/blogs/:blogId/drafts/:draftId/variants",
      pathParams: GetDraftVariantsPathParams,
      query: PaginatedQuery,
      responses: {
        200: GetDraftVariantsResponse,
      },
    },
    publishDraft: {
      method: "POST",
      path: "/blogs/:blogId/drafts/:draftId/publish",
      pathParams: PublishDraftPathParams,
      query: Variant,
      body: z.any().optional(),
      responses: {
        200: PublishDraftResponse,
      },
    },
    deleteArticle: {
      method: "DELETE",
      path: "/blogs/:blogId/articles/:articleId",
      pathParams: DeleteArticlePathParams,
      query: Variant,
      responses: {
        200: z.void(),
      },
    },
    getArticles: {
      method: "GET",
      path: "/blogs/:blogId/articles",
      pathParams: GetArticlesPathParams,
      query: PaginatedQuery,
      responses: {
        200: GetArticlesResponse,
      },
    },
    getArticle: {
      method: "GET",
      path: "/blogs/:blogId/articles/:articleId",
      pathParams: GetArticlePathParams,
      query: Variant,
      responses: {
        200: GetArticleResponse,
      },
    },
    getArticleVariants: {
      method: "GET",
      path: "/blogs/:blogId/articles/:articleId/variants",
      pathParams: GetArticleVariantsPathParams,
      query: PaginatedQuery,
      responses: {
        200: GetArticleVariantsResponse,
      },
    },
  },
  {
    pathPrefix: "/v1",
  }
);
