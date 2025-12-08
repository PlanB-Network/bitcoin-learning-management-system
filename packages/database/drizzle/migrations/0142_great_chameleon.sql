CREATE TYPE "public"."educator_content_type" AS ENUM('presentation', 'workshop', 'booklet', 'flyer', 'sticker');--> statement-breakpoint
CREATE TABLE "content"."educator_content_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"educator_content_id" uuid NOT NULL,
	"path" text NOT NULL,
	"name" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content"."educator_content_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"educator_content_id" uuid NOT NULL,
	"url" text NOT NULL,
	"label" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "content"."educator_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "educator_content_type" NOT NULL,
	"cover" uuid,
	"language" varchar(10) DEFAULT 'en' NOT NULL,
	"title" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "content"."educator_content_files" ADD CONSTRAINT "educator_content_files_educator_content_id_educator_contents_id_fk" FOREIGN KEY ("educator_content_id") REFERENCES "content"."educator_contents"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."educator_content_links" ADD CONSTRAINT "educator_content_links_educator_content_id_educator_contents_id_fk" FOREIGN KEY ("educator_content_id") REFERENCES "content"."educator_contents"("id") ON DELETE cascade ON UPDATE cascade;