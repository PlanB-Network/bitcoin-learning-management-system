ALTER TABLE "content"."course_chapters_localized_professors" DROP CONSTRAINT "course_chapters_localized_professors_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."course_parts" DROP CONSTRAINT "course_parts_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."course_professors" DROP CONSTRAINT "course_professors_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."course_tags" DROP CONSTRAINT "course_tags_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."courses_localized" DROP CONSTRAINT "courses_localized_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."course_payment" DROP CONSTRAINT "course_payment_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."course_progress" DROP CONSTRAINT "course_progress_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" DROP CONSTRAINT "course_user_chapter_course_id_courses_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_tags" ADD CONSTRAINT "course_tags_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."courses_localized" ADD CONSTRAINT "courses_localized_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
