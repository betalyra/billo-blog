import {
  bigserial,
  boolean,
  index,
  integer,
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
import { VariantType, VariantTypeEnum, type Block } from "@billo-blog/contract";
import { z } from "zod";

export const schema = pgSchema("billo_blog");

export const UsersTable = schema.table("users", {
  internalId: bigserial({ mode: "number" }).primaryKey(),
  id: text().unique().notNull().$defaultFn(createId),
  email: text().unique(),
  emailVerified: boolean().notNull().default(false),
  status: text().notNull().default("active"),
  lastSignInAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type User = InferSelectModel<typeof UsersTable>;
export type NewUser = InferInsertModel<typeof UsersTable>;

export const SessionsTable = schema.table("sessions", {
  internalId: bigserial({ mode: "number" }).primaryKey(),
  id: text().unique().notNull().$defaultFn(createId),
  userId: bigserial({ mode: "number" })
    .notNull()
    .references(() => UsersTable.internalId),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  lastRefreshedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type Session = InferSelectModel<typeof SessionsTable>;
export type NewSession = InferInsertModel<typeof SessionsTable>;

export const OAuthAccountsTable = schema.table("oauth_account", {
  internalId: bigserial({ mode: "number" }).primaryKey(),
  id: text().unique().notNull().$defaultFn(createId),
  userId: bigserial({ mode: "number" })
    .notNull()
    .references(() => UsersTable.internalId, { onDelete: "cascade" }),
  provider: text().notNull(),
  providerAccountId: text().notNull(),

  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export type OAuthAccount = typeof OAuthAccountsTable.$inferSelect;
export type InsertOAuthAccount = typeof OAuthAccountsTable.$inferInsert;

export const TokenPermissionEnum = schema.enum("token_permission", [
  "read",
  "write",
]);

// API tokens table
export const ApiTokensTable = schema.table(
  "api_tokens",
  {
    internalId: bigserial({ mode: "number" }).primaryKey(),
    id: text().unique().notNull().$defaultFn(createId),
    name: text().notNull(),
    // Using a descriptive name helps identify the token's purpose
    description: text(),

    // The actual token value (hashed)
    tokenHash: text().notNull(),

    // Reference to the user who created the token
    userId: bigserial({ mode: "number" })
      .notNull()
      .references(() => UsersTable.internalId, { onDelete: "cascade" }),

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
export type ApiToken = typeof ApiTokensTable.$inferSelect;
export type InsertApiToken = typeof ApiTokensTable.$inferInsert;

export const BlogsTable = schema.table("blogs", {
  internalId: bigserial({ mode: "number" }).primaryKey(),
  id: text().unique().notNull().$defaultFn(createId),
  ownerId: bigserial({ mode: "number" })
    .notNull()
    .references(() => UsersTable.internalId, { onDelete: "cascade" }),
  name: text(),
  slug: text().unique(),
  created: timestamp({
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
});

export type NewBlog = typeof BlogsTable.$inferInsert;
export type GetBlog = typeof BlogsTable.$inferSelect;

// Extended variant types enum
export const PgVariantTypeEnum = schema.enum("variant_type", VariantTypeEnum);

export const VariantDefinition = z.object({
  type: VariantType,
  key: z.string(),
});
export type VariantDefinition = z.infer<typeof VariantDefinition>;

export const DraftsTable = schema.table(
  "drafts",
  {
    internalId: bigserial({ mode: "number" }).primaryKey(),
    id: text().notNull().$defaultFn(createId),
    blogId: bigserial({ mode: "number" })
      .notNull()
      .references(() => BlogsTable.internalId, { onDelete: "cascade" }),
    name: text(),
    slug: text(),
    content: jsonb().notNull().default([]).$type<Block[]>(),
    metadata: jsonb().notNull().default({}).$type<Record<string, any>>(),
    variants: jsonb().$type<VariantDefinition[]>().notNull().default([]),
    version: integer().notNull().default(0),
    created: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
    updated: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Composite unique constraint on all version-related fields
    unique().on(t.blogId, t.id, t.variants, t.version),
    unique().on(t.blogId, t.slug, t.variants, t.version),
  ]
);

export type NewDraft = typeof DraftsTable.$inferInsert;
export type GetDraft = typeof DraftsTable.$inferSelect;

// Article versions table - stores immutable published versions
export const ArticlesTable = schema.table(
  "articles",
  {
    blogId: bigserial({ mode: "number" })
      .notNull()
      .references(() => BlogsTable.internalId, { onDelete: "cascade" }),
    internalId: bigserial({ mode: "number" }).primaryKey(),
    id: text().notNull(),
    draftId: bigserial({ mode: "number" })
      .unique()
      .notNull()
      .references(() => DraftsTable.internalId, { onDelete: "cascade" }),
    name: text(),
    slug: text(),
    content: jsonb().notNull().default([]).$type<Block[]>(),
    metadata: jsonb().notNull().default({}).$type<Record<string, any>>(),
    variants: jsonb().$type<VariantDefinition[]>().notNull().default([]),
    publishedAt: timestamp({ mode: "date", withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique().on(t.blogId, t.id, t.variants),
    unique().on(t.blogId, t.slug, t.variants),
    index().on(t.blogId, t.slug, t.variants),
  ]
);
export type NewArticle = typeof ArticlesTable.$inferInsert;
export type GetArticle = typeof ArticlesTable.$inferSelect;
