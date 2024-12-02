CREATE TYPE "billo_blog"."variant_type" AS ENUM('translation', 'ab_test', 'format', 'audience', 'season', 'region', 'platform', 'experiment');--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" DROP CONSTRAINT "articles_blogId_id_unique";--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" DROP CONSTRAINT "drafts_blogId_id_version_unique";--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" DROP CONSTRAINT "drafts_blogId_slug_version_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "articles_blog_id_slug_index";--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" ADD COLUMN "variant_type" "billo_blog"."variant_type";--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" ADD COLUMN "variant_key" text;--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" ADD COLUMN "variant_type" "billo_blog"."variant_type";--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" ADD COLUMN "variant_key" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "articles_blog_id_slug_variant_type_variant_key_index" ON "billo_blog"."articles" USING btree ("blog_id","slug","variant_type","variant_key");--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" ADD CONSTRAINT "articles_blogId_id_variantType_variantKey_unique" UNIQUE("blog_id","id","variant_type","variant_key");--> statement-breakpoint
ALTER TABLE "billo_blog"."articles" ADD CONSTRAINT "articles_blogId_slug_variantType_variantKey_unique" UNIQUE("blog_id","slug","variant_type","variant_key");--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" ADD CONSTRAINT "drafts_blogId_id_variantType_variantKey_version_unique" UNIQUE("blog_id","id","variant_type","variant_key","version");--> statement-breakpoint
ALTER TABLE "billo_blog"."drafts" ADD CONSTRAINT "drafts_blogId_slug_variantType_variantKey_version_unique" UNIQUE("blog_id","slug","variant_type","variant_key","version");