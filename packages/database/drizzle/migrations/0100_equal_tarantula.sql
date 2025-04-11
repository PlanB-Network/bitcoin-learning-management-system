ALTER TYPE "public"."notification_type" ADD VALUE 'calendar_24h' BEFORE 'celebration';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'calendar_5m' BEFORE 'celebration';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'results' BEFORE 'warning';--> statement-breakpoint
ALTER TABLE "users"."notifications" ALTER COLUMN "course_id" DROP NOT NULL;