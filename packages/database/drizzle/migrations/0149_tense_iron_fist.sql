CREATE TABLE "users"."course_highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"text" text NOT NULL,
	"start_offset" integer NOT NULL,
	"end_offset" integer NOT NULL,
	"start_container_path" varchar(500) NOT NULL,
	"end_container_path" varchar(500) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."educator_content_status";--> statement-breakpoint
CREATE TYPE "public"."educator_content_status" AS ENUM('draft', 'published', 'rejected');--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."educator_content_status";--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ALTER COLUMN "status" SET DATA TYPE "public"."educator_content_status" USING "status"::"public"."educator_content_status";--> statement-breakpoint
ALTER TABLE "users"."course_highlights" ADD CONSTRAINT "course_highlights_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."course_highlights" ADD CONSTRAINT "course_highlights_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "course_highlights_chapter_idx" ON "users"."course_highlights" USING btree ("uid","chapter_id");