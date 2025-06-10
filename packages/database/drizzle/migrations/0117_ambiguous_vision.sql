ALTER TABLE "content"."courses" ADD COLUMN "is_assignment_grading_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."course_progress" ADD COLUMN "assignment_grade" integer;--> statement-breakpoint
ALTER TABLE "users"."course_progress" ADD COLUMN "ranking" integer;