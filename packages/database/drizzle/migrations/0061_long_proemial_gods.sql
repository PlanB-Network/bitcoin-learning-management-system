ALTER TABLE "content"."blog_tags" RENAME COLUMN "blog_id" TO "blog_old_id";--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" RENAME COLUMN "blog_id" TO "blog_old_id";--> statement-breakpoint
ALTER TABLE "content"."blog_tags" DROP CONSTRAINT "blog_tags_blog_id_blogs_old_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP CONSTRAINT "blogs_localized_blog_id_blogs_old_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."blog_tags" DROP CONSTRAINT "blog_tags_blog_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP CONSTRAINT "blogs_localized_blog_id_language_pk";--> statement-breakpoint
ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_old_id_tag_id_pk" PRIMARY KEY("blog_old_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_old_id_language_pk" PRIMARY KEY("blog_old_id","language");--> statement-breakpoint
ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_old_id_blogs_old_id_fk" FOREIGN KEY ("blog_old_id") REFERENCES "content"."blogs"("old_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_old_id_blogs_old_id_fk" FOREIGN KEY ("blog_old_id") REFERENCES "content"."blogs"("old_id") ON DELETE no action ON UPDATE no action;