CREATE TABLE IF NOT EXISTS "users"."files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"data" "bytea",
	"s3" boolean DEFAULT false NOT NULL,
	"s3_key" varchar(255),
	"checksum" varchar(64) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mimetype" varchar(255) NOT NULL,
	"filesize" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD COLUMN "picture" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."files" ADD CONSTRAINT "files_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
