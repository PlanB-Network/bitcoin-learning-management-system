UPDATE users.course_user_chapter cc SET chapter_id = (SELECT chapter_id from content.course_chapters WHERE part=cc.part and chapter=cc.chapter and course_id=cc.course_id);--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" DROP CONSTRAINT "course_user_chapter_uid_course_id_part_chapter_pk";--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" ALTER COLUMN "chapter_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_uid_course_id_chapter_id_pk" PRIMARY KEY("uid","course_id","chapter_id");--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "users"."course_user_chapter" DROP COLUMN IF EXISTS "chapter";