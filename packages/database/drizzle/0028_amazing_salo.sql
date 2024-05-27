ALTER TABLE "content"."course_chapters" ALTER COLUMN "chapter_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ALTER COLUMN "chapter_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" ALTER COLUMN "chapter_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_parts" ALTER COLUMN "part_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" ALTER COLUMN "part_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters" ADD COLUMN "part_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
