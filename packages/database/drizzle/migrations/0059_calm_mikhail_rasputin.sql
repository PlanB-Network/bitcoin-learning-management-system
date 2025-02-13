ALTER TABLE "content"."blog_tags" DROP CONSTRAINT "blog_tags_blog_id_blogs_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP CONSTRAINT "blogs_localized_blog_id_blogs_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."blogs" ADD CONSTRAINT "blogs_id_unique" UNIQUE("id");
ALTER TABLE "content"."blogs" DROP CONSTRAINT "blogs_pkey" CASCADE; --> statement-breakpoint
ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

