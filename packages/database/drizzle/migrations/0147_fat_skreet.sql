CREATE TABLE "users"."mentor_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"session_key" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users"."mentor_messages" ADD CONSTRAINT "mentor_messages_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "mentor_messages_session_idx" ON "users"."mentor_messages" USING btree ("uid","session_key","created_at");