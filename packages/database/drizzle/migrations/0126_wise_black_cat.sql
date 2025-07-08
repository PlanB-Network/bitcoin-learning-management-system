ALTER TABLE "content"."course_assignment" ALTER COLUMN "mentor" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_assignment" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_assignment" ALTER COLUMN "telegram_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "assignment_description" text;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "assignment_end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "assignment_start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "has_assignment" boolean DEFAULT false NOT NULL;