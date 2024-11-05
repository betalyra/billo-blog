import { Context, Effect, Layer, Option } from "effect";
import { DrizzlePostgresProvider } from "../../db/postgres/provider.js";
import {
  ArticlesTable,
  BlogTable,
  type GetArticle,
  type GetBlog,
} from "../../../db/postgres/schema.js";
import { z } from "zod";
import { and, eq, sql, desc } from "drizzle-orm";
import { PaginatedAndCountedQuery, PaginatedQuery } from "../types.js";

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
}
export class BlogStoreService extends Context.Tag("BlogStoreService")<
  BlogStoreService,
  IBlogStoreService
>() {}

export const BlogStoreServiceLive = Layer.effect(
  BlogStoreService,
  Effect.gen(function* () {
    const { postgresDrizzle } = yield* DrizzlePostgresProvider;
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
            })
            .returning()
        );
        if (article.length === 0) {
          return Option.none();
        } else {
          return Option.some(article[0]!);
        }
      });
    return {
      createBlog,
      getBlog,
      getBlogs,
      createArticle,
    };
  })
);
