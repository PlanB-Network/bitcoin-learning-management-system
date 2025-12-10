CREATE TABLE "content"."research_papers" (
	"id" uuid NOT NULL,
	"resource_id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"abstract" text NOT NULL,
	"authors" text[] NOT NULL,
	"publication_date" text,
	"source" text NOT NULL,
	"language" text NOT NULL,
	"topics" varchar(255)[],
	"type" text NOT NULL,
	"paper_url" text NOT NULL,
	"bib_url" text NOT NULL,
	CONSTRAINT "research_papers_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "users"."mentor_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"session_key" varchar(255) NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content"."research_papers" ADD CONSTRAINT "research_papers_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."mentor_messages" ADD CONSTRAINT "mentor_messages_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "mentor_messages_session_idx" ON "users"."mentor_messages" USING btree ("uid","session_key","created_at");