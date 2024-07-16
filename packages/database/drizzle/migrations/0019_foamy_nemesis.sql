CREATE TABLE IF NOT EXISTS "content"."coupon_code" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"item_id" varchar(100) NOT NULL,
	"reduction_percentage" integer,
	"is_unique" boolean DEFAULT true NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"uid" uuid,
	"time_used" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."coupon_code" ADD CONSTRAINT "coupon_code_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
