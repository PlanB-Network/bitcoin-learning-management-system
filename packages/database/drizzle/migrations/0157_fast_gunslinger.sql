ALTER TABLE "content"."blog_tags" DROP CONSTRAINT "blog_tags_blog_id_blogs_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" DROP CONSTRAINT "blogs_localized_blog_id_blogs_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."books_localized" ALTER COLUMN "summary_contributor_id" SET DATA TYPE varchar(63);--> statement-breakpoint
ALTER TABLE "content"."contributors" ALTER COLUMN "id" SET DATA TYPE varchar(63);--> statement-breakpoint
ALTER TABLE "content"."proofreading_contributor" ALTER COLUMN "contributor_id" SET DATA TYPE varchar(63);--> statement-breakpoint
ALTER TABLE "users"."accounts" ALTER COLUMN "contributor_id" SET DATA TYPE varchar(63);--> statement-breakpoint
ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE cascade ON UPDATE no action;