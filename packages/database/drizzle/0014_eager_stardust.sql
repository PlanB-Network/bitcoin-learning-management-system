ALTER TABLE "content"."course_chapters_localized" ALTER COLUMN "is_online" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ALTER COLUMN "is_in_person" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP COLUMN IF EXISTS "release_date";