CREATE TABLE "content"."course_assignment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"file_url" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users"."course_progress" ADD COLUMN "is_selected_for_assignment" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users"."course_progress" ADD COLUMN "applied_assignment_ids" uuid[];--> statement-breakpoint
ALTER TABLE "users"."course_progress" ADD COLUMN "affected_assignment_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."course_assignment" ADD CONSTRAINT "course_assignment_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_affected_assignment_id_course_assignment_id_fk" FOREIGN KEY ("affected_assignment_id") REFERENCES "content"."course_assignment"("id") ON DELETE cascade ON UPDATE no action;