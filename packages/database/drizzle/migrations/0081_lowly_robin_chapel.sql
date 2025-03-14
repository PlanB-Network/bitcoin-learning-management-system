ALTER TABLE "content"."events" ADD COLUMN "is_gdpr_compliance" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "custom_tc_disclaimer" text;