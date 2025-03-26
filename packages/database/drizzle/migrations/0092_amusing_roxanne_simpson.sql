ALTER TABLE "content"."coupon_code" ADD COLUMN "uses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."coupon_code" ADD COLUMN "max_uses" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
UPDATE "content"."coupon_code" SET "max_uses" = 100 WHERE "is_unique" = false;--> statement-breakpoint
ALTER TABLE "content"."coupon_code" DROP COLUMN "is_unique";--> statement-breakpoint
UPDATE "content"."coupon_code" SET "uses" = 1 WHERE "is_used" = true;--> statement-breakpoint
ALTER TABLE "content"."coupon_code" DROP COLUMN "is_used";--> statement-breakpoint
ALTER TABLE "content"."coupon_code" DROP COLUMN "time_used";
