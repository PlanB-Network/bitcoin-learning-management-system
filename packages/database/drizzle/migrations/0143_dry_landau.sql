CREATE TYPE "public"."educator_content_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ADD COLUMN "status" "educator_content_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ADD COLUMN "original_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ADD COLUMN "uid" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ADD CONSTRAINT "educator_contents_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ADD CONSTRAINT "educator_contents_original_id_fk" FOREIGN KEY ("original_id") REFERENCES "content"."educator_contents"("id") ON DELETE cascade ON UPDATE cascade;