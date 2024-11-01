import {
  bigserial,
  boolean,
  pgSchema,
  text,
  timestamp,
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
});

export type Session = InferSelectModel<typeof SessionTable>;
export type NewSession = InferInsertModel<typeof SessionTable>;
