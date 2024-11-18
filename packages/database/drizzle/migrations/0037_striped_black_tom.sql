CREATE TABLE IF NOT EXISTS "users"."api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"revoked_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."api_keys" ADD CONSTRAINT "api_keys_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE OR REPLACE TRIGGER api_keys_auto_updated_at BEFORE UPDATE ON "users"."api_keys" FOR EACH ROW EXECUTE FUNCTION users.auto_updated_at();
