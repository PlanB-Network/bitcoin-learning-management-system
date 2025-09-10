CREATE TYPE "public"."course_type" AS ENUM('practice', 'theory');--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "type" "course_type" DEFAULT 'theory' NOT NULL;