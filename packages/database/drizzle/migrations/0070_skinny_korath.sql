ALTER TABLE "content"."quiz_questions" DROP CONSTRAINT "quiz_questions_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."exam_attempts" DROP CONSTRAINT "exam_attempts_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."course_chapters" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."course_parts" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."course_professors" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."course_tags" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."courses_localized" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."proofreading" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users"."course_payment" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users"."course_progress" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users"."course_review" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "users"."exam_attempts" ALTER COLUMN "course_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ADD CONSTRAINT "quiz_questions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."exam_attempts" ADD CONSTRAINT "exam_attempts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;