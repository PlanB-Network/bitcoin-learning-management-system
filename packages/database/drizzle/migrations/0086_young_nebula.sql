ALTER TABLE "content"."courses" ADD COLUMN "is_gdpr_compliance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "custom_tc_disclaimer" text;