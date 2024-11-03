import {
  bigserial,
  boolean,
  jsonb,
  pgEnum,
  pgSchema,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const schema = pgSchema("billo_blog");

export const UserTable = schema.table("user", {
  id: bigserial({ mode: "number" }).primaryKey(),
  publicId: text().unique().notNull().$defaultFn(createId),
  email: text().unique().notNull(),
  emailVerified: boolean().notNull().default(false),
  status: text().notNull().default("active"),
  lastSignInAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type User = InferSelectModel<typeof UserTable>;
export type NewUser = InferInsertModel<typeof UserTable>;

export const SessionTable = schema.table("session", {
  id: text().primaryKey().$defaultFn(createId),
  userId: bigserial({ mode: "number" })
    .notNull()
    .references(() => UserTable.id),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  lastRefreshedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Session = InferSelectModel<typeof SessionTable>;
export type NewSession = InferInsertModel<typeof SessionTable>;

export const OAuthAccountTable = schema.table("oauth_account", {
  id: text().primaryKey().$defaultFn(createId),
  userId: bigserial({ mode: "number" })
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  provider: text().notNull(),
  providerAccountId: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type OAuthAccount = typeof OAuthAccountTable.$inferSelect;
export type InsertOAuthAccount = typeof OAuthAccountTable.$inferInsert;

export const TokenPermissionEnum = pgEnum("token_permission", [
  "read",
  "write",
]);

// API tokens table
export const ApiTokenTable = schema.table(
  "api_token",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    publicId: text().unique().notNull().$defaultFn(createId),
    name: text().notNull(),
    // Using a descriptive name helps identify the token's purpose
    description: text(),

    // The actual token value (hashed)
    tokenHash: text().notNull(),

    // Reference to the user who created the token
    userId: bigserial({ mode: "number" })
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),

    // Token permissions
    permission: TokenPermissionEnum().notNull(),

    // Token status
    isRevoked: boolean().default(false).notNull(),
    lastUsedAt: timestamp({ withTimezone: true }),

    // Expiration (optional, null means never expires)
    expiresAt: timestamp({ withTimezone: true }),

    // Audit fields
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    // Index for faster lookups by token hash
    uniqueIndex().on(table.tokenHash),
    // Index for faster lookups by user
    uniqueIndex().on(table.userId, table.name),
  ]
);
export type ApiToken = typeof ApiTokenTable.$inferSelect;
export type InsertApiToken = typeof ApiTokenTable.$inferInsert;

export const BlogTable = schema.table("blogs", {
  id: bigserial({ mode: "number" }).primaryKey(),
  publicId: text().unique().notNull().$defaultFn(createId),
  ownerId: bigserial({ mode: "number" })
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  name: text(),
  slug: text().unique(),
  created: timestamp({
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});

export type NewBlog = typeof BlogTable.$inferInsert;
export type GetBlog = typeof BlogTable.$inferSelect;

export const ArticlesTable = schema.table(
  "articles",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    publicId: text().unique().notNull().$defaultFn(createId),
    blogId: bigserial({ mode: "number" })
      .notNull()
      .references(() => BlogTable.id, { onDelete: "cascade" }),
    name: text(),
    slug: text(),
    content: jsonb().default([]),
    created: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.slug, t.blogId, t.updated)]
);

export type NewArticle = typeof ArticlesTable.$inferInsert;
export type GetArticle = typeof ArticlesTable.$inferSelect;

export const PublishedArticlesTable = schema.table(
  "published_articles",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    publicId: text().unique().notNull().$defaultFn(createId),
    articleId: bigserial({ mode: "number" })
      .notNull()
      .references(() => ArticlesTable.id, { onDelete: "cascade" }),
    blogId: bigserial({ mode: "number" })
      .notNull()
      .references(() => BlogTable.id, { onDelete: "cascade" }),
    name: text(),
    slug: text(),
    content: jsonb().default([]),
    published: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.slug, t.blogId, t.published)]
);
export type NewPublishedArticle = typeof PublishedArticlesTable.$inferInsert;
export type GetPublishedArticle = typeof PublishedArticlesTable.$inferSelect;
