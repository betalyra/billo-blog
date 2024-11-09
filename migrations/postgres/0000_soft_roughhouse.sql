CREATE SCHEMA "billo_blog";
--> statement-breakpoint
CREATE TYPE "billo_blog"."token_permission" AS ENUM('read', 'write');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."api_tokens" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"token_hash" text NOT NULL,
	"user_id" bigserial NOT NULL,
	"permission" "billo_blog"."token_permission" NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_tokens_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."articles" (
	"blog_id" bigserial NOT NULL,
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"draft_id" bigserial NOT NULL,
	"name" text,
	"slug" text,
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_draftId_unique" UNIQUE("draft_id"),
	CONSTRAINT "articles_blogId_id_unique" UNIQUE("blog_id","id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."blogs" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"owner_id" bigserial NOT NULL,
	"name" text,
	"slug" text,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_id_unique" UNIQUE("id"),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."drafts" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"blog_id" bigserial NOT NULL,
	"name" text,
	"slug" text,
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "drafts_blogId_id_version_unique" UNIQUE("blog_id","id","version"),
	CONSTRAINT "drafts_blogId_slug_version_unique" UNIQUE("blog_id","slug","version")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."oauth_account" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_account_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."sessions" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"user_id" bigserial NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."users" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"id" text NOT NULL,
	"email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_sign_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_id_unique" UNIQUE("id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."api_tokens" ADD CONSTRAINT "api_tokens_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "billo_blog"."users"("internal_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."articles" ADD CONSTRAINT "articles_blog_id_blogs_internal_id_fk" FOREIGN KEY ("blog_id") REFERENCES "billo_blog"."blogs"("internal_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."articles" ADD CONSTRAINT "articles_draft_id_drafts_internal_id_fk" FOREIGN KEY ("draft_id") REFERENCES "billo_blog"."drafts"("internal_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."blogs" ADD CONSTRAINT "blogs_owner_id_users_internal_id_fk" FOREIGN KEY ("owner_id") REFERENCES "billo_blog"."users"("internal_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."drafts" ADD CONSTRAINT "drafts_blog_id_blogs_internal_id_fk" FOREIGN KEY ("blog_id") REFERENCES "billo_blog"."blogs"("internal_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."oauth_account" ADD CONSTRAINT "oauth_account_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "billo_blog"."users"("internal_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."sessions" ADD CONSTRAINT "sessions_user_id_users_internal_id_fk" FOREIGN KEY ("user_id") REFERENCES "billo_blog"."users"("internal_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "api_tokens_token_hash_index" ON "billo_blog"."api_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "api_tokens_user_id_name_index" ON "billo_blog"."api_tokens" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_blog_id_slug_index" ON "billo_blog"."articles" USING btree ("blog_id","slug");