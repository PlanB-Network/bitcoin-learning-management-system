ALTER TABLE "users"."course_user_chapter" ALTER COLUMN "completed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" ALTER COLUMN "completed_at" DROP NOT NULL;