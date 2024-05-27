ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" ADD COLUMN "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" ADD COLUMN "part_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users"."course_payment" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "users"."course_payment" DROP COLUMN IF EXISTS "chapter";