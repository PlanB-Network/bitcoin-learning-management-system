ALTER TABLE "content"."coupon_code" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."coupon_code" ADD COLUMN "deleted_at" timestamp with time zone;
