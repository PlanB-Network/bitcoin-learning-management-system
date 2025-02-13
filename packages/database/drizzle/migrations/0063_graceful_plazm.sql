ALTER TABLE "content"."blogs" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "content"."blogs" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."blog_tags" ADD COLUMN "blog_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD COLUMN "blog_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE no action ON UPDATE no action;