ALTER TABLE "users"."course_user_chapter" ADD COLUMN "chapter_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
