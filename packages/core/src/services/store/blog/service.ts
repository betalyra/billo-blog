import { Context, Effect, Layer, Option } from "effect";
import { DrizzlePostgresProvider } from "../../db/postgres/provider.js";
import {
  ArticlesTable,
  BlogsTable,
  DraftsTable,
  type GetDraft,
  type GetBlog,
} from "../../../db/postgres/schema.js";
import { z } from "zod";
import { and, eq, sql, desc, or, lt } from "drizzle-orm";
import { PaginatedAndCountedQuery, PaginatedQuery } from "../types.js";
import { Block } from "@billo-blog/contract";
import { EnvService } from "../../env/service.js";

export const CreateBlogRequest = z.object({
  ownerId: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
});
export type CreateBlogRequest = z.infer<typeof CreateBlogRequest>;

export const GetBlogRequest = z.object({
  id: z.string(),
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

export const DeleteBlogRequest = z.object({
  id: z.string(),
  ownerId: z.number(),
});
export type DeleteBlogRequest = z.infer<typeof DeleteBlogRequest>;

export const CreateDraftRequest = z.object({
  blogInternalId: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
});
export type CreateDraftRequest = z.infer<typeof CreateDraftRequest>;

export const UpdateDraftRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  content: z.array(Block).optional(),
});
export type UpdateDraftRequest = z.infer<typeof UpdateDraftRequest>;
export const GetDraftRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
});
export type GetDraftRequest = z.infer<typeof GetDraftRequest>;
export const GetDraftsRequest = PaginatedQuery.merge(
  z.object({
    blogInternalId: z.number(),
  })
);
export type GetDraftsRequest = z.infer<typeof GetDraftsRequest>;
export type GetDraftsResponse = PaginatedAndCountedQuery & {
  drafts: GetDraft[];
};

export const UpsertArticleRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  content: z.array(Block).optional(),
  metadata: z.record(z.any()).optional(),
});
export type UpsertArticleRequest = z.infer<typeof UpsertArticleRequest>;

export const DeleteArticleRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
});
export type DeleteArticleRequest = z.infer<typeof DeleteArticleRequest>;

export const DeleteDraftRequest = z.object({
  blogInternalId: z.number(),
  draftId: z.number(),
});
export type DeleteDraftRequest = z.infer<typeof DeleteDraftRequest>;

export const UpsertArticleResponse = z.object({
  articleId: z.string(),
});
export type UpsertArticleResponse = z.infer<typeof UpsertArticleResponse>;
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
  deleteBlog: (request: DeleteBlogRequest) => Effect.Effect<void, Error>;
  createDraft: (
    request: CreateDraftRequest
  ) => Effect.Effect<Option.Option<GetDraft>, Error>;
  updateDraft: (
    request: UpdateDraftRequest
  ) => Effect.Effect<Option.Option<GetDraft>, Error>;
  getDraft: (
    request: GetDraftRequest
  ) => Effect.Effect<Option.Option<GetDraft>, Error>;
  getDrafts: (
    request: GetDraftsRequest
  ) => Effect.Effect<GetDraftsResponse, Error>;
  deleteDraft: (request: DeleteDraftRequest) => Effect.Effect<void, Error>;
  upsertArticle: (
    request: UpsertArticleRequest
  ) => Effect.Effect<UpsertArticleResponse, Error>;
  deleteArticle: (request: DeleteArticleRequest) => Effect.Effect<void, Error>;
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
            .insert(BlogsTable)
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
    const getBlog: IBlogStoreService["getBlog"] = ({ id, ownerId }) =>
      Effect.gen(function* () {
        const blog = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(BlogsTable)
            .where(and(eq(BlogsTable.id, id), eq(BlogsTable.ownerId, ownerId)))
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
              .from(BlogsTable)
              .where(eq(BlogsTable.ownerId, ownerId))
              .orderBy(desc(BlogsTable.created))
              .limit(limit)
              .offset(page * limit)
          ),
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({ count: sql<number>`count(*) :: int` })
              .from(BlogsTable)
              .where(eq(BlogsTable.ownerId, ownerId))
          ).pipe(Effect.map((result) => result[0]?.count ?? 0)),
        ]);
        return {
          blogs,
          count,
          page,
          limit,
        };
      });

    const deleteBlog: IBlogStoreService["deleteBlog"] = ({ id, ownerId }) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          postgresDrizzle
            .delete(BlogsTable)
            .where(and(eq(BlogsTable.id, id), eq(BlogsTable.ownerId, ownerId)))
        );
      });
    const createDraft: IBlogStoreService["createDraft"] = ({
      blogInternalId,
      name,
      slug,
    }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .insert(DraftsTable)
            .values({
              blogId: blogInternalId,
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
    const updateDraft: IBlogStoreService["updateDraft"] = ({
      blogInternalId,
      id,
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
                version: DraftsTable.version,
                updated: DraftsTable.updated,
              })
              .from(DraftsTable)
              .where(
                and(
                  eq(DraftsTable.blogId, blogInternalId),
                  eq(DraftsTable.id, id)
                )
              )
              .orderBy(desc(DraftsTable.updated))
              .limit(1);
            if (!latest || latest.length === 0) {
              throw new Error("No article found");
            }
            const { version, updated } = latest[0]!;

            const now = new Date();
            const secondsAgoDate = new Date(
              now.getTime() - ARTICLE_UPDATE_INTERVAL * 1000
            );

            if (new Date(updated) < secondsAgoDate) {
              // Insert a new version if the latest version is older than one minute
              return await tx
                .insert(DraftsTable)
                .values({
                  blogId: blogInternalId,
                  id,
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
                .update(DraftsTable)
                .set({ name, slug, content, updated: now })
                .where(
                  and(
                    eq(DraftsTable.blogId, blogInternalId),
                    eq(DraftsTable.id, id),
                    eq(DraftsTable.version, version)
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

    const getDraft: IBlogStoreService["getDraft"] = ({ blogInternalId, id }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(DraftsTable)
            .where(
              and(
                eq(DraftsTable.blogId, blogInternalId),
                eq(DraftsTable.id, id)
              )
            )
        );
        if (article.length === 0) {
          return Option.none();
        } else {
          return Option.some(article[0]!);
        }
      });
    const getDrafts: IBlogStoreService["getDrafts"] = ({
      blogInternalId,
      page,
      limit,
    }) =>
      Effect.gen(function* () {
        const [drafts, count] = yield* Effect.all([
          Effect.tryPromise(() =>
            postgresDrizzle
              .select()
              .from(DraftsTable)
              .where(eq(DraftsTable.blogId, blogInternalId))
              .orderBy(desc(DraftsTable.updated))
              .limit(limit)
              .offset(page * limit)
          ),
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({ count: sql<number>`count(*) :: int` })
              .from(DraftsTable)
              .where(eq(DraftsTable.blogId, blogInternalId))
          ).pipe(Effect.map((result) => result[0]?.count ?? 0)),
        ]);
        return {
          drafts,
          count,
          page,
          limit,
        };
      });

    const deleteDraft: IBlogStoreService["deleteDraft"] = ({
      blogInternalId,
      draftId,
    }) => Effect.gen(function* () {});

    const upsertArticle: IBlogStoreService["upsertArticle"] = ({
      blogInternalId,
      id,
      name,
      slug,
      content,
      metadata,
    }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .insert(ArticlesTable)
            .values({
              blogId: blogInternalId,
              id,
              name,
              slug,
              content,
              metadata,
              publishedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [ArticlesTable.blogId, ArticlesTable.id],
              set: { name, slug, content, metadata, publishedAt: new Date() },
            })
            .returning()
        );
        if (article.length === 0) {
          return yield* Effect.fail(new Error("Failed to upsert article"));
        } else {
          return {
            articleId: article[0]!.id,
          };
        }
      });

    const deleteArticle: IBlogStoreService["deleteArticle"] = ({
      blogInternalId,
      id,
    }) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          postgresDrizzle
            .delete(ArticlesTable)
            .where(
              and(
                eq(ArticlesTable.blogId, blogInternalId),
                eq(ArticlesTable.id, id)
              )
            )
        );
      });

    return {
      createBlog,
      getBlog,
      getBlogs,
      deleteBlog,
      createDraft,
      updateDraft,
      getDraft,
      getDrafts,
      deleteDraft,
      upsertArticle,
      deleteArticle,
    };
  })
);
