ALTER TABLE "users"."accounts" ADD COLUMN "community_id" uuid;--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD COLUMN "community_joined_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_community_id_projects_id_fk" FOREIGN KEY ("community_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;