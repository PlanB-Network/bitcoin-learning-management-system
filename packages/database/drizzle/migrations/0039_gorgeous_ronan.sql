DO $$ BEGIN
 CREATE TYPE "token_type" AS ENUM('validate_email', 'reset_password', 'login');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"type" "token_type" NOT NULL,
	"data" varchar(255),
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."tokens" ADD CONSTRAINT "tokens_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
