import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { OGArticleSchema, OGBasicSchema } from "../types/opengraph.js";
import { Block } from "../types/blocknote.js";
export * from "../types/blocknote.js";
const c = initContract();
export const ID = z.string().cuid2();
export const Paginated = z.object({
    limit: z.coerce.number().optional(),
    page: z.coerce.number().optional(),
});
export const Counted = z.object({
    count: z.number(),
});
export const PaginatedAndCounted = Paginated.merge(Counted);
export const GetBlogPathParams = z.object({
    blogId: ID,
});
export const GetBlogResponse = z.object({
    id: ID,
    name: z.string().nullable(),
});
export const GetBlogsResponse = PaginatedAndCounted.merge(z.object({
    blogs: z.array(GetBlogResponse),
}));
export const GetArticleResponse = z.object({
    id: ID,
    slug: z.string(),
    author: ID,
    og: OGBasicSchema,
    ogArticle: OGArticleSchema,
    blocks: z.array(Block),
});
export const GetArticlesParams = z.object({
    blogId: ID,
});
export const GetArticlesResponse = PaginatedAndCounted.merge(z.object({
    articles: z.array(GetArticleResponse),
}));
export const GetArticleParams = z.object({
    blogId: ID,
    articleId: ID,
});
export const billoblogContract = c.router({
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
            200: GetBlogResponse,
            404: z.any(),
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
            200: GetArticleResponse,
            404: z.any(),
        },
    },
}, {
    pathPrefix: "/v1",
});
//# sourceMappingURL=index.js.map