CREATE TYPE "public"."exam_type" AS ENUM('final', 'single_trial');--> statement-breakpoint
ALTER TABLE "users"."exam_attempts" ADD COLUMN "exam_type" "exam_type" DEFAULT 'final' NOT NULL;