DO $$ BEGIN
 CREATE TYPE "public"."course_format" AS ENUM('online', 'inperson', 'hybrid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."course_payment_format" AS ENUM('online', 'inperson');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "format" "course_format" DEFAULT 'online' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "online_price_dollars" integer;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "inperson_price_dollars" integer;--> statement-breakpoint
ALTER TABLE "users"."course_payment" ADD COLUMN "format" "course_payment_format" DEFAULT 'inperson' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."courses" DROP COLUMN IF EXISTS "paid_price_dollars";