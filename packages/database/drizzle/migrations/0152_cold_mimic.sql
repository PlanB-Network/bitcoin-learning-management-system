ALTER TABLE "content"."educator_contents" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."educator_content_type";--> statement-breakpoint
CREATE TYPE "public"."educator_content_type" AS ENUM('art', 'booklet', 'flyer', 'game', 'other', 'presentation', 'sticker', 'workshop');--> statement-breakpoint
ALTER TABLE "content"."educator_contents" ALTER COLUMN "type" SET DATA TYPE "public"."educator_content_type" USING "type"::"public"."educator_content_type";