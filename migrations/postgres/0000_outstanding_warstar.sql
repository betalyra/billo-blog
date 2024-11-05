CREATE SCHEMA "billo_blog";
--> statement-breakpoint
CREATE TYPE "billo_blog"."token_permission" AS ENUM('read', 'write');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."api_token" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
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
	CONSTRAINT "api_token_publicId_unique" UNIQUE("public_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."articles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"blog_id" bigserial NOT NULL,
	"name" text,
	"slug" text,
	"content" jsonb DEFAULT '[]'::jsonb,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	"updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "articles_publicId_unique" UNIQUE("public_id"),
	CONSTRAINT "articles_slug_blogId_updated_unique" UNIQUE("slug","blog_id","updated")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."blogs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"owner_id" bigserial NOT NULL,
	"name" text,
	"slug" text,
	"created" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_publicId_unique" UNIQUE("public_id"),
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."oauth_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."published_articles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"article_id" bigserial NOT NULL,
	"blog_id" bigserial NOT NULL,
	"name" text,
	"slug" text,
	"content" jsonb DEFAULT '[]'::jsonb,
	"published" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "published_articles_publicId_unique" UNIQUE("public_id"),
	CONSTRAINT "published_articles_slug_blogId_published_unique" UNIQUE("slug","blog_id","published")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" bigserial NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_refreshed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "billo_blog"."user" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"email" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_sign_in_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_publicId_unique" UNIQUE("public_id"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."api_token" ADD CONSTRAINT "api_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "billo_blog"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."articles" ADD CONSTRAINT "articles_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "billo_blog"."blogs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."blogs" ADD CONSTRAINT "blogs_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "billo_blog"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."oauth_account" ADD CONSTRAINT "oauth_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "billo_blog"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."published_articles" ADD CONSTRAINT "published_articles_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "billo_blog"."articles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."published_articles" ADD CONSTRAINT "published_articles_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "billo_blog"."blogs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "billo_blog"."session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "billo_blog"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "api_token_token_hash_index" ON "billo_blog"."api_token" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "api_token_user_id_name_index" ON "billo_blog"."api_token" USING btree ("user_id","name");