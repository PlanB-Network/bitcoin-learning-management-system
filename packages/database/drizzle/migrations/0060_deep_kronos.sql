ALTER TABLE "content"."blogs" RENAME COLUMN "id" TO "old_id";--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP CONSTRAINT "blogs_localized_blog_id_blogs_id_fk";
ALTER TABLE "content"."blog_tags" DROP CONSTRAINT "blog_tags_blog_id_blogs_id_fk";
ALTER TABLE "content"."blogs" DROP CONSTRAINT "blogs_id_unique";--> statement-breakpoint
ALTER TABLE "content"."blogs" ADD CONSTRAINT "blogs_oldId_unique" UNIQUE("old_id");
ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_id_blogs_old_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("old_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_id_blogs_old_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("old_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
