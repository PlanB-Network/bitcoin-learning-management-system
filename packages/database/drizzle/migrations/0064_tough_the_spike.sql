ALTER TABLE "content"."blog_tags" DROP CONSTRAINT "blog_tags_blog_old_id_blogs_old_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP CONSTRAINT "blogs_localized_blog_old_id_blogs_old_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."blog_tags" DROP CONSTRAINT "blog_tags_blog_old_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP CONSTRAINT "blogs_localized_blog_old_id_language_pk";--> statement-breakpoint
ALTER TABLE "content"."blog_tags" ALTER COLUMN "blog_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ALTER COLUMN "blog_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_id_tag_id_pk" PRIMARY KEY("blog_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_id_language_pk" PRIMARY KEY("blog_id","language");--> statement-breakpoint
ALTER TABLE "content"."blog_tags" DROP COLUMN "blog_old_id";--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP COLUMN "blog_old_id";