ALTER TABLE "content"."courses" ADD COLUMN "available_seats" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "remaining_seats" integer;