DELETE FROM "content"."quiz_questions";--> statement-breakpoint
ALTER TABLE "content"."course_chapters" RENAME COLUMN "chapter" TO "chapter_index";--> statement-breakpoint
ALTER TABLE "content"."course_parts" RENAME COLUMN "part" TO "part_index";--> statement-breakpoint
ALTER TABLE "content"."course_chapters" DROP CONSTRAINT "course_chapters_to_course_parts_fk";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP CONSTRAINT "course_chapters_localized_to_course_chapters_fk";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP CONSTRAINT "course_chapters_localized_to_course_parts_localized_fk";--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" DROP CONSTRAINT "course_parts_localized_to_course_parts_fk";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" DROP CONSTRAINT "quizzes_to_course_chapters_fk";--> statement-breakpoint
ALTER TABLE "content"."course_chapters" DROP CONSTRAINT "course_chapters_course_id_part_chapter_pk";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP CONSTRAINT "course_chapters_localized_course_id_part_chapter_language_pk";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" DROP CONSTRAINT "course_chapters_localized_professors_contributor_id_course_id_part_chapter_language_pk";--> statement-breakpoint
ALTER TABLE "content"."course_parts" DROP CONSTRAINT "course_parts_course_id_part_pk";--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" DROP CONSTRAINT "course_parts_localized_course_id_part_language_pk";--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" DROP CONSTRAINT "quiz_attempts_uid_course_id_part_chapter_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ADD COLUMN "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" ADD COLUMN "chapter_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_chapter_id_pk" PRIMARY KEY("chapter_id");--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_course_id_chapter_id_language_pk" PRIMARY KEY("course_id","chapter_id","language");--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_contributor_id_course_id_chapter_id_language_pk" PRIMARY KEY("contributor_id","course_id","chapter_id","language");--> statement-breakpoint
ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_course_id_part_id_pk" PRIMARY KEY("course_id","part_id");--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_course_id_part_id_language_pk" PRIMARY KEY("course_id","part_id","language");--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_uid_chapter_id_pk" PRIMARY KEY("uid","chapter_id");--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_to_course_parts_fk" FOREIGN KEY ("course_id","part_id") REFERENCES "content"."course_parts"("course_id","part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_to_course_parts_fk" FOREIGN KEY ("course_id","part_id") REFERENCES "content"."course_parts"("course_id","part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_questions" ADD CONSTRAINT "quiz_questions_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "content"."course_chapters" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP COLUMN IF EXISTS "chapter";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" DROP COLUMN IF EXISTS "chapter";--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" DROP COLUMN IF EXISTS "course_id";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" DROP COLUMN IF EXISTS "chapter";--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" DROP COLUMN IF EXISTS "course_id";--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" DROP COLUMN IF EXISTS "part";--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" DROP COLUMN IF EXISTS "chapter";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ADD CONSTRAINT "quiz_questions_chapter_id_unique" UNIQUE("chapter_id");