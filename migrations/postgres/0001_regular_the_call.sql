CREATE TYPE "billo_blog"."variant_type" AS ENUM('lang', 'ab_test', 'format', 'audience', 'region');--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" DROP CONSTRAINT "articles_blogId_id_unique";--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" DROP CONSTRAINT "drafts_blogId_id_version_unique";--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" DROP CONSTRAINT "drafts_blogId_slug_version_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "articles_blog_id_slug_index";--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" ADD COLUMN "variant" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" ADD COLUMN "variant" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_blog_id_slug_variant_index" ON "billo_blog"."articles" USING btree ("blog_id","slug","variant");--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" ADD CONSTRAINT "articles_blogId_id_variant_unique" UNIQUE("blog_id","id","variant");--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" ADD CONSTRAINT "articles_blogId_slug_variant_unique" UNIQUE("blog_id","slug","variant");--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" ADD CONSTRAINT "drafts_blogId_id_variant_version_unique" UNIQUE("blog_id","id","variant","version");--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" ADD CONSTRAINT "drafts_blogId_slug_variant_version_unique" UNIQUE("blog_id","slug","variant","version");