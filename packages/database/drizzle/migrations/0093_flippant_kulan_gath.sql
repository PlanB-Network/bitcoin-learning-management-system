CREATE TABLE "users"."sessions" (
	"sid" varchar(255) PRIMARY KEY NOT NULL,
	"uid" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	"cookie" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users"."sessions" ADD CONSTRAINT "sessions_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;