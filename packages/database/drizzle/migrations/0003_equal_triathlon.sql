ALTER TABLE "users"."course_payment" ADD COLUMN "part" integer;--> statement-breakpoint
ALTER TABLE "users"."course_payment" ADD COLUMN "chapter" integer;--> statement-breakpoint
ALTER TABLE "users"."course_payment" ADD COLUMN "with_physical" boolean DEFAULT false;