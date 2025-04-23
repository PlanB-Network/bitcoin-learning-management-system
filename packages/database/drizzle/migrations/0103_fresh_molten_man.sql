ALTER TABLE "content"."videos" DROP CONSTRAINT "videos_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."videos" ADD CONSTRAINT "videos_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;