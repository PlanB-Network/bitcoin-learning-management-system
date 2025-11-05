ALTER TABLE "users"."course_payment" DROP CONSTRAINT "course_payment_coupon_code_coupon_code_code_fk";
--> statement-breakpoint
ALTER TABLE "users"."event_payment" DROP CONSTRAINT "event_payment_coupon_code_coupon_code_code_fk";
--> statement-breakpoint
ALTER TABLE "users"."general_payment" DROP CONSTRAINT "general_payment_coupon_code_coupon_code_code_fk";
--> statement-breakpoint
ALTER TABLE "content"."coupon_code" DROP CONSTRAINT "coupon_code_pkey";
--> statement-breakpoint
ALTER TABLE "content"."coupon_code" ADD CONSTRAINT "coupon_code_code_item_id_pk" PRIMARY KEY("code","item_id");
