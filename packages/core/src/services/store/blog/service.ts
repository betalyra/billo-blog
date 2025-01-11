import { Context, Effect, Either, Layer, Option } from "effect";
import { DrizzlePostgresProvider } from "../../db/postgres/provider.js";
import {
  ArticlesTable,
  BlogsTable,
  DraftsTable,
  type GetDraft,
  type GetBlog,
  type GetArticle,
  VariantDefinition,
} from "../../../db/postgres/schema.js";
import { z } from "zod";
import { and, eq, sql, desc, or, lt } from "drizzle-orm";
import { PaginatedAndCounted, PaginatedQuery } from "@billo-blog/contract";
import { Block } from "@billo-blog/contract";
import { EnvService } from "../../env/service.js";
import { ConflictError } from "../../../errors/types.js";
import postgres from "postgres";

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

export type GetBlogsResponse = PaginatedAndCounted & {
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
  blocks: z.array(Block).optional(),
  variant: VariantDefinition,
});
export type CreateDraftRequest = z.infer<typeof CreateDraftRequest>;

export const CreateDraftVariantRequest = z.object({
  blogInternalId: z.number(),
  draftId: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  blocks: z.array(Block).optional(),
  variant: VariantDefinition,
});
export type CreateDraftVariantRequest = z.infer<
  typeof CreateDraftVariantRequest
>;

export const UpdateDraftRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
  name: z.string().optional(),
  slug: z.string().optional(),
  blocks: z.array(Block).optional(),
  variant: VariantDefinition,
});
export type UpdateDraftRequest = z.infer<typeof UpdateDraftRequest>;
export const GetDraftRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
  variant: VariantDefinition,
});
export type GetDraftRequest = z.infer<typeof GetDraftRequest>;
export const GetDraftsRequest = PaginatedQuery.merge(
  z.object({
    blogInternalId: z.number(),
    variant: VariantDefinition,
  })
);

export type GetDraftSummary = Pick<
  GetDraft,
  | "id"
  | "internalId"
  | "blogId"
  | "name"
  | "slug"
  | "created"
  | "updated"
  | "version"
>;
export type GetDraftsRequest = z.infer<typeof GetDraftsRequest>;
export type GetDraftsResponse = PaginatedAndCounted & {
  drafts: GetDraftSummary[];
};

export const UpsertArticleRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
  draftId: z.number(),
  name: z.string().optional(),
  slug: z.string().optional(),
  content: z.array(Block).optional(),
  metadata: z.record(z.any()).optional(),
  variant: VariantDefinition,
});
export type UpsertArticleRequest = z.infer<typeof UpsertArticleRequest>;

export const DeleteArticleRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
  variant: VariantDefinition,
});
export type DeleteArticleRequest = z.infer<typeof DeleteArticleRequest>;

export const DeleteDraftRequest = z.object({
  blogInternalId: z.number(),
  draftId: z.string(),
  variant: VariantDefinition,
});
export type DeleteDraftRequest = z.infer<typeof DeleteDraftRequest>;

export const UpsertArticleResponse = z.object({
  articleId: z.string(),
});
export type UpsertArticleResponse = z.infer<typeof UpsertArticleResponse>;

export const GetArticlesRequest = PaginatedQuery.merge(
  z.object({
    blogInternalId: z.number(),
    variant: VariantDefinition,
  })
);

export type GetArticleSummary = Pick<
  GetArticle,
  "id" | "internalId" | "blogId" | "name" | "slug" | "publishedAt"
>;
export type GetArticlesRequest = z.infer<typeof GetArticlesRequest>;
export type GetArticlesResponse = PaginatedAndCounted & {
  articles: GetArticleSummary[];
};

export const GetArticleRequest = z.object({
  blogInternalId: z.number(),
  id: z.string(),
  variant: VariantDefinition,
});
export type GetArticleRequest = z.infer<typeof GetArticleRequest>;

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
  createDraftVariant: (
    request: CreateDraftVariantRequest
  ) => Effect.Effect<Option.Option<GetDraft>, Error | ConflictError>;
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
  getArticles: (
    request: GetArticlesRequest
  ) => Effect.Effect<GetArticlesResponse, Error>;
  getArticle: (
    request: GetArticleRequest
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
    const getBlogs: IBlogStoreService["getBlogs"] = (query) =>
      Effect.gen(function* () {
        const limit = query.limit ?? 10;
        const page = query.page ?? 0;
        const ownerId = query.ownerId;
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
      blocks,
      variant,
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
              content: blocks ?? [],
              variant,
            })
            .returning()
        );
        if (article.length === 0) {
          return Option.none();
        } else {
          return Option.some(article[0]!);
        }
      });

    const createDraftVariant: IBlogStoreService["createDraftVariant"] = ({
      blogInternalId,
      draftId,
      name,
      slug,
      blocks,
      variant,
    }) =>
      Effect.gen(function* () {
        const eitherArticle = yield* Effect.tryPromise(async () => {
          const result: Either.Either<GetDraft[], Error | ConflictError> =
            await postgresDrizzle
              .insert(DraftsTable)
              .values({
                id: draftId,
                blogId: blogInternalId,
                name,
                slug,
                updated: new Date(),
                content: blocks ?? [],
                variant,
              })
              .returning()
              .then(Either.right)
              .catch((e) => {
                if (e instanceof postgres.PostgresError && e.code === "23505") {
                  return Either.left(new ConflictError());
                }
                return Either.left(e as Error);
              });
          return result;
        });
        const article = yield* eitherArticle;

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
      blocks,
      variant,
    }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle.transaction(async (tx) => {
            // Get latest version

            const variantConstraints = getVariantsConstraints(variant);

            const latest = await tx
              .select({
                version: DraftsTable.version,
                updated: DraftsTable.updated,
              })
              .from(DraftsTable)
              .where(
                and(
                  eq(DraftsTable.blogId, blogInternalId),
                  eq(DraftsTable.id, id),
                  ...variantConstraints
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
                  content: blocks,
                  version: version + 1,
                  updated: now,
                  variant,
                })
                .returning();
            } else {
              // Update the latest version if it's within the last minute
              return await tx
                .update(DraftsTable)
                .set({ name, slug, content: blocks, updated: now })
                .where(
                  and(
                    eq(DraftsTable.blogId, blogInternalId),
                    eq(DraftsTable.id, id),
                    eq(DraftsTable.version, version),
                    ...variantConstraints
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

    const getDraft: IBlogStoreService["getDraft"] = ({
      blogInternalId,
      id,
      variant,
    }) =>
      Effect.gen(function* () {
        const variantConstraints = getVariantsConstraints(variant);
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(DraftsTable)
            .where(
              and(
                eq(DraftsTable.blogId, blogInternalId),
                eq(DraftsTable.id, id),
                ...variantConstraints
              )
            )
            .orderBy(desc(DraftsTable.version))
            .limit(1)
        );
        if (article.length === 0) {
          return Option.none();
        } else {
          return Option.some(article[0]!);
        }
      });
    const getDrafts: IBlogStoreService["getDrafts"] = (query) =>
      Effect.gen(function* () {
        const limit = query.limit ?? 10;
        const page = query.page ?? 0;
        const blogInternalId = query.blogInternalId;
        const variantConstraints = getVariantsConstraints(query.variant);
        const [drafts, count] = yield* Effect.all([
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({
                id: DraftsTable.id,
                internalId: DraftsTable.internalId,
                blogId: DraftsTable.blogId,
                name: DraftsTable.name,
                slug: DraftsTable.slug,
                created: DraftsTable.created,
                updated: DraftsTable.updated,
                version: DraftsTable.version,
              })
              .from(DraftsTable)
              .where(
                and(
                  eq(DraftsTable.blogId, blogInternalId),
                  ...variantConstraints
                )
              )
              .orderBy(desc(DraftsTable.updated))
              .limit(limit)
              .offset(page * limit)
          ),
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({ count: sql<number>`count(*) :: int` })
              .from(DraftsTable)
              .where(
                and(
                  eq(DraftsTable.blogId, blogInternalId),
                  ...variantConstraints
                )
              )
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
      variant,
    }) =>
      Effect.gen(function* () {
        const variantConstraints = getVariantsConstraints(variant);
        yield* Effect.tryPromise(() =>
          postgresDrizzle
            .delete(DraftsTable)
            .where(
              and(
                eq(DraftsTable.blogId, blogInternalId),
                eq(DraftsTable.id, draftId),
                ...variantConstraints
              )
            )
        );
      });

    const upsertArticle: IBlogStoreService["upsertArticle"] = ({
      blogInternalId,
      id,
      draftId,
      name,
      slug,
      content,
      metadata,
      variant,
    }) =>
      Effect.gen(function* () {
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .insert(ArticlesTable)
            .values({
              blogId: blogInternalId,
              id,
              draftId,
              name,
              slug,
              content,
              metadata,
              publishedAt: new Date(),
              variant,
            })
            .onConflictDoUpdate({
              target: [ArticlesTable.blogId, ArticlesTable.id],
              set: {
                id,
                draftId,
                name,
                slug,
                content,
                metadata,
                publishedAt: new Date(),
                variant,
              },
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
      variant,
    }) =>
      Effect.gen(function* () {
        const variantConstraints = getVariantsConstraints(variant);
        yield* Effect.tryPromise(() =>
          postgresDrizzle
            .delete(ArticlesTable)
            .where(
              and(
                eq(ArticlesTable.blogId, blogInternalId),
                eq(ArticlesTable.id, id),
                ...variantConstraints
              )
            )
        );
      });

    const getArticles: IBlogStoreService["getArticles"] = (query) =>
      Effect.gen(function* () {
        const limit = query.limit ?? 10;
        const page = query.page ?? 0;
        const blogInternalId = query.blogInternalId;
        const variantConstraints = getVariantsConstraints(query.variant);
        const [articles, count] = yield* Effect.all([
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({
                id: ArticlesTable.id,
                internalId: ArticlesTable.internalId,
                blogId: ArticlesTable.blogId,
                name: ArticlesTable.name,
                slug: ArticlesTable.slug,
                publishedAt: ArticlesTable.publishedAt,
              })
              .from(ArticlesTable)
              .where(
                and(
                  eq(ArticlesTable.blogId, blogInternalId),
                  ...variantConstraints
                )
              )
          ),
          Effect.tryPromise(() =>
            postgresDrizzle
              .select({ count: sql<number>`count(*) :: int` })
              .from(ArticlesTable)
              .where(
                and(
                  eq(ArticlesTable.blogId, blogInternalId),
                  ...variantConstraints
                )
              )
          ).pipe(Effect.map((result) => result[0]?.count ?? 0)),
        ]);
        return {
          articles,
          count,
          page,
          limit,
        };
      });
    const getArticle: IBlogStoreService["getArticle"] = ({
      blogInternalId,
      id,
      variant,
    }) =>
      Effect.gen(function* () {
        const variantConstraints = getVariantsConstraints(variant);
        const article = yield* Effect.tryPromise(() =>
          postgresDrizzle
            .select()
            .from(ArticlesTable)
            .where(
              and(
                eq(ArticlesTable.blogId, blogInternalId),
                eq(ArticlesTable.id, id),
                ...variantConstraints
              )
            )
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
      deleteBlog,
      createDraft,
      createDraftVariant,
      updateDraft,
      getDraft,
      getDrafts,
      deleteDraft,
      upsertArticle,
      deleteArticle,
      getArticles,
      getArticle,
    };
  })
);

const getVariantsConstraints = (variant: VariantDefinition) => {
  const constraints = [];

  // Only add constraints for defined (non-undefined) variant attributes
  if (variant.lang) {
    constraints.push(sql`${DraftsTable.variant}->>'lang' = ${variant.lang}`);
  } else {
    constraints.push(sql`${DraftsTable.variant}->>'lang' IS NULL`);
  }
  if (variant.ab_test) {
    constraints.push(
      sql`${DraftsTable.variant}->>'ab_test' = ${variant.ab_test}`
    );
  } else {
    constraints.push(sql`${DraftsTable.variant}->>'ab_test' IS NULL`);
  }
  if (variant.format) {
    constraints.push(
      sql`${DraftsTable.variant}->>'format' = ${variant.format}`
    );
  } else {
    constraints.push(sql`${DraftsTable.variant}->>'format' IS NULL`);
  }
  if (variant.audience) {
    constraints.push(
      sql`${DraftsTable.variant}->>'audience' = ${variant.audience}`
    );
  } else {
    constraints.push(sql`${DraftsTable.variant}->>'audience' IS NULL`);
  }
  if (variant.region) {
    constraints.push(
      sql`${DraftsTable.variant}->>'region' = ${variant.region}`
    );
  } else {
    constraints.push(sql`${DraftsTable.variant}->>'region' IS NULL`);
  }

  return constraints;
};
