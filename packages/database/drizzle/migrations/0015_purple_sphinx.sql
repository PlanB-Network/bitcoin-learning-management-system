ALTER TABLE "content"."events" RENAME COLUMN "is_online" TO "book_online";--> statement-breakpoint
ALTER TABLE "content"."events" RENAME COLUMN "is_in_person" TO "book_in_person";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "live_language" text;