import { Context, Effect, Layer, Option } from "effect";
import { DrizzlePostgresProvider } from "../../db/postgres/provider.js";
import {
  ArticlesTable,
  BlogTable,
  type GetArticle,
  type GetBlog,
} from "../../../db/postgres/schema.js";
import { z } from "zod";
import { and, eq, sql, desc, or, lt } from "drizzle-orm";
import { PaginatedAndCountedQuery, PaginatedQuery } from "../types.js";
import { Block } from "@billo-blog/contract";
import { cons } from "effect/List";
import { EnvService } from "../../env/service.js";

export const CreateBlogRequest = z.object({
  ownerId: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
});
export type CreateBlogRequest = z.infer<typeof CreateBlogRequest>;

export const GetBlogRequest = z.object({
  blogPublicId: z.string(),
  ownerId: z.number(),
});
export type GetBlogRequest = z.infer<typeof GetBlogRequest>;

export const GetBlogsRequest = PaginatedQuery.merge(
  z.object({
    ownerId: z.number(),
  })
);
export type GetBlogsRequest = z.infer<typeof GetBlogsRequest>;

export type GetBlogsResponse = PaginatedAndCountedQuery & {
  blogs: GetBlog[];
};
export const CreateArticleRequest = z.object({
  blogId: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
});
export type CreateArticleRequest = z.infer<typeof CreateArticleRequest>;

export const UpdateArticleRequest = z.object({
  blogId: z.number(),
  articlePublicId: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  content: z.array(Block).optional(),
});
export type UpdateArticleRequest = z.infer<typeof UpdateArticleRequest>;
export const GetArticleRequest = z.object({
  blogId: z.number(),
  articlePublicId: z.string(),
});
export type GetArticleRequest = z.infer<typeof GetArticleRequest>;
export const GetArticlesRequest = PaginatedQuery.merge(
  z.object({
    blogId: z.number(),
  })
);
export type GetArticlesRequest = z.infer<typeof GetArticlesRequest>;
export type GetArticlesResponse = PaginatedAndCountedQuery & {
  articles: GetArticle[];
};
export interface IBlogStoreService {
  createBlog: (
    request: CreateBlogRequest
  ) => Effect.Effect<Option.Option<GetBlog>, Error>;
  getBlog: (
    request: GetBlogRequest
  ) => Effect.Effect<Option.Option<GetBlog>, Error>;
  getBlogs: (
    request: GetBlogsRequest
  ) => Effect.Effect<GetBlogsResponse, Error>;
  createArticle: (
    request: CreateArticleRequest
  ) => Effect.Effect<Option.Option<GetArticle>, Error>;
  updateArticle: (
    request: UpdateArticleRequest
  ) => Effect.Effect<Option.Option<GetArticle>, Error>;
  getArticle: (
    request: GetArticleRequest
  ) => Effect.Effect<Option.Option<GetArticle>, Error>;
  getArticles: (
    request: GetArticlesRequest
  ) => Effect.Effect<GetArticlesResponse, Error>;
}
export class BlogStoreService extends Context.Tag("BlogStoreService")<
  BlogStoreService,
  IBlogStoreService
>() {}

export const BlogStoreServiceLive = Layer.effect(
  BlogStoreService,
  Effect.gen(function* () {
    const { postgresDrizzle } = yield* DrizzlePostgresProvider;
    const { ARTICLE_UPDATE_INTERVAL } = yield* EnvService;

    const createBlog: IBlogStoreService["createBlog"] = ({
      ownerId,
      name,
      slug,
    }) =>
      Effect.gen(function* () {
        const blog = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .insert(BlogTable)
            .values({
              ownerId,
              name,
              slug,
            })
            .returning()
        );
        if (blog.length === 0) {
          return Option.none();
        } else {
          return Option.some(blog[0]!);
        }
      });
    const getBlog: IBlogStoreService["getBlog"] = ({ blogPublicId, ownerId }) =>
      Effect.gen(function* () {
        const blog = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(BlogTable)
            .where(
              and(
                eq(BlogTable.publicId, blogPublicId),
                eq(BlogTable.ownerId, ownerId)
              )
            )
        );
        if (blog.length === 0) {
          return Option.none();
        } else {
          return Option.some(blog[0]!);
        }
      });
    const getBlogs: IBlogStoreService["getBlogs"] = ({
      ownerId,
      page,
      limit,
    }) =>
      Effect.gen(function* () {
        const [blogs, count] = yield* Effect.all([
          Effect.tryPromise(() =>
            postgresDrizzle
              .select()
              .from(BlogTable)
              .where(eq(BlogTable.ownerId, ownerId))
              .orderBy(desc(BlogTable.created))
              .limit(limit)
              .offset(page * limit)
          ),
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({ count: sql<number>`count(*) :: int` })
              .from(BlogTable)
              .where(eq(BlogTable.ownerId, ownerId))
          ).pipe(Effect.map((result) => result[0]?.count ?? 0)),
        ]);
        return {
          blogs,
          count,
          page,
          limit,
        };
      });
    const createArticle: IBlogStoreService["createArticle"] = ({
      blogId,
      name,
      slug,
    }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .insert(ArticlesTable)
            .values({
              blogId,
              name,
              slug,
              updated: new Date(),
              content: [],
            })
            .returning()
        );
        if (article.length === 0) {
          return Option.none();
        } else {
          return Option.some(article[0]!);
        }
      });
    const updateArticle: IBlogStoreService["updateArticle"] = ({
      blogId,
      articlePublicId,
      name,
      slug,
      content,
    }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle.transaction(async (tx) => {
            // Get latest version
            const latest = await tx
              .select({
                version: ArticlesTable.version,
                updated: ArticlesTable.updated,
                status: ArticlesTable.status,
              })
              .from(ArticlesTable)
              .where(
                and(
                  eq(ArticlesTable.blogId, blogId),
                  eq(ArticlesTable.publicId, articlePublicId)
                )
              )
              .orderBy(desc(ArticlesTable.updated))
              .limit(1);
            if (!latest || latest.length === 0) {
              throw new Error("No article found");
            }
            const { version, updated, status } = latest[0]!;

            const now = new Date();
            const secondsAgo = ARTICLE_UPDATE_INTERVAL;

            const secondsAgoDate = new Date(now.getTime() - secondsAgo * 1000);

            if (new Date(updated) < secondsAgoDate || status === "published") {
              // Insert a new version if the latest version is older than one minute
              return await tx
                .insert(ArticlesTable)
                .values({
                  blogId,
                  publicId: articlePublicId,
                  name,
                  slug,
                  content,
                  version: version + 1,
                  updated: now,
                })
                .returning();
            } else {
              // Update the latest version if it's within the last minute
              return await tx
                .update(ArticlesTable)
                .set({ name, slug, content, updated: now })
                .where(
                  and(
                    eq(ArticlesTable.blogId, blogId),
                    eq(ArticlesTable.publicId, articlePublicId),
                    eq(ArticlesTable.version, version)
                  )
                )
                .returning();
            }
          })
        );
        if (article.length === 0) {
          return Option.none();
        } else {
          return Option.some(article[0]!);
        }
      });

    const getArticle: IBlogStoreService["getArticle"] = ({
      blogId,
      articlePublicId,
    }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(ArticlesTable)
            .where(
              and(
                eq(ArticlesTable.blogId, blogId),
                eq(ArticlesTable.publicId, articlePublicId)
              )
            )
        );
        if (article.length === 0) {
          return Option.none();
        } else {
          return Option.some(article[0]!);
        }
      });
    const getArticles: IBlogStoreService["getArticles"] = ({
      blogId,
      page,
      limit,
    }) =>
      Effect.gen(function* () {
        const [articles, count] = yield* Effect.all([
          Effect.tryPromise(() =>
            postgresDrizzle
              .select()
              .from(ArticlesTable)
              .where(eq(ArticlesTable.blogId, blogId))
              .orderBy(desc(ArticlesTable.updated))
              .limit(limit)
              .offset(page * limit)
          ),
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({ count: sql<number>`count(*) :: int` })
              .from(ArticlesTable)
              .where(eq(ArticlesTable.blogId, blogId))
          ).pipe(Effect.map((result) => result[0]?.count ?? 0)),
        ]);
        return {
          articles,
          count,
          page,
          limit,
        };
      });
    return {
      createBlog,
      getBlog,
      getBlogs,
      createArticle,
      updateArticle,
      getArticle,
      getArticles,
    };
  })
);
