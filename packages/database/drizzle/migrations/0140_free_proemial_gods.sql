ALTER TABLE "content"."coupon_code" DROP CONSTRAINT "coupon_code_code_item_id_pk";--> statement-breakpoint
ALTER TABLE "content"."coupon_code" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."coupon_code" ADD CONSTRAINT "coupon_code_code_itemId_unique" UNIQUE("code","item_id");