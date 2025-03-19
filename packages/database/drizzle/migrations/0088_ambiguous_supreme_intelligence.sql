ALTER TABLE "content"."b_certificate_exam" DROP CONSTRAINT "b_certificate_exam_path_unique";--> statement-breakpoint
ALTER TABLE "content"."blogs" DROP CONSTRAINT "blogs_path_unique";--> statement-breakpoint
ALTER TABLE "content"."events" DROP CONSTRAINT "events_path_unique";--> statement-breakpoint
ALTER TABLE "content"."professors" DROP CONSTRAINT "professors_path_unique";--> statement-breakpoint
ALTER TABLE "content"."tutorials" DROP CONSTRAINT "tutorials_path_unique";--> statement-breakpoint
ALTER TABLE "content"."tutorials" DROP CONSTRAINT "tutorials_name_category_unique";
