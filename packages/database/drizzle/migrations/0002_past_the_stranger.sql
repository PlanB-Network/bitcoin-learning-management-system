ALTER TABLE "users"."accounts" DROP CONSTRAINT "accounts_username_key";--> statement-breakpoint
ALTER TABLE "users"."accounts" DROP CONSTRAINT "accounts_display_name_key";--> statement-breakpoint
ALTER TABLE "users"."accounts" DROP CONSTRAINT "accounts_email_key";--> statement-breakpoint
ALTER TABLE "users"."accounts" DROP CONSTRAINT "accounts_contributor_id_key";--> statement-breakpoint
ALTER TABLE "users"."lud4_public_keys" DROP CONSTRAINT "lud4_public_keys_public_key_key";--> statement-breakpoint
ALTER TABLE "content"."professors" DROP CONSTRAINT "professors_path_key";--> statement-breakpoint
ALTER TABLE "content"."professors" DROP CONSTRAINT "professors_name_key";--> statement-breakpoint
ALTER TABLE "content"."professors" DROP CONSTRAINT "professors_contributor_id_key";--> statement-breakpoint
ALTER TABLE "content"."resources" DROP CONSTRAINT "resources_category_path_key";--> statement-breakpoint
ALTER TABLE "content"."tags" DROP CONSTRAINT "tags_name_key";--> statement-breakpoint
ALTER TABLE "content"."tutorials" DROP CONSTRAINT "tutorials_path_key";--> statement-breakpoint
ALTER TABLE "content"."tutorials" DROP CONSTRAINT "tutorials_name_category_key";--> statement-breakpoint
ALTER TABLE "content"."course_chapters" DROP CONSTRAINT "fk_course_chapters_to_course_parts";
--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP CONSTRAINT "fk_course_chapters_localized_to_course_chapters";
--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP CONSTRAINT "fk_course_chapters_localized_to_course_localized";
--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP CONSTRAINT "fk_course_chapters_localized_to_course_parts_localized";
--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" DROP CONSTRAINT "fk_course_parts_localized_to_course_parts";
--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" DROP CONSTRAINT "fk_course_parts_localized_to_course_localized";
--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" DROP CONSTRAINT "fk_quizzes_to_course_chapters";
--> statement-breakpoint
DROP INDEX IF EXISTS "idx_course_completed_chapters_account";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_course_completed_chapters_course";--> statement-breakpoint
ALTER TABLE "content"."books_localized" DROP CONSTRAINT "books_localized_pkey";--> statement-breakpoint
ALTER TABLE "content"."builders_localized" DROP CONSTRAINT "builders_localized_pkey";--> statement-breakpoint
ALTER TABLE "content"."course_chapters" DROP CONSTRAINT "course_chapters_pkey";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" DROP CONSTRAINT "course_chapters_localized_pkey";--> statement-breakpoint
ALTER TABLE "users"."course_completed_chapters" DROP CONSTRAINT "course_completed_chapters_pkey";--> statement-breakpoint
ALTER TABLE "content"."course_parts" DROP CONSTRAINT "course_parts_pkey";--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" DROP CONSTRAINT "course_parts_localized_pkey";--> statement-breakpoint
ALTER TABLE "users"."course_payment" DROP CONSTRAINT "course_payment_pkey";--> statement-breakpoint
ALTER TABLE "content"."course_professors" DROP CONSTRAINT "course_professors_pkey";--> statement-breakpoint
ALTER TABLE "users"."course_progress" DROP CONSTRAINT "course_progress_pkey";--> statement-breakpoint
ALTER TABLE "content"."course_tags" DROP CONSTRAINT "course_tags_pkey";--> statement-breakpoint
ALTER TABLE "content"."courses_localized" DROP CONSTRAINT "courses_localized_pkey";--> statement-breakpoint
ALTER TABLE "content"."professor_tags" DROP CONSTRAINT "professor_tags_pkey";--> statement-breakpoint
ALTER TABLE "content"."professors_localized" DROP CONSTRAINT "professors_localized_pkey";--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" DROP CONSTRAINT "quiz_attempts_pkey";--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_pkey";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_pkey";--> statement-breakpoint
ALTER TABLE "content"."resource_tags" DROP CONSTRAINT "resource_tags_pkey";--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" DROP CONSTRAINT "tutorial_tags_pkey";--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" DROP CONSTRAINT "tutorials_localized_pkey";--> statement-breakpoint
ALTER TABLE "users"."accounts" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users"."accounts" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content"."courses" ALTER COLUMN "paid_start_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content"."courses" ALTER COLUMN "paid_end_date" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users"."lud4_public_keys" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users"."lud4_public_keys" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "content"."books_localized" ADD CONSTRAINT "books_localized_book_id_language_pk" PRIMARY KEY("book_id","language");--> statement-breakpoint
ALTER TABLE "content"."builders_localized" ADD CONSTRAINT "builders_localized_builder_id_language_pk" PRIMARY KEY("builder_id","language");--> statement-breakpoint
ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_course_id_part_chapter_pk" PRIMARY KEY("course_id","part","chapter");--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_course_id_part_chapter_language_pk" PRIMARY KEY("course_id","part","chapter","language");--> statement-breakpoint
ALTER TABLE "users"."course_completed_chapters" ADD CONSTRAINT "course_completed_chapters_uid_course_id_part_chapter_pk" PRIMARY KEY("uid","course_id","part","chapter");--> statement-breakpoint
ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_course_id_part_pk" PRIMARY KEY("course_id","part");--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_course_id_part_language_pk" PRIMARY KEY("course_id","part","language");--> statement-breakpoint
ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_uid_course_id_payment_id_pk" PRIMARY KEY("uid","course_id","payment_id");--> statement-breakpoint
ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_course_id_contributor_id_pk" PRIMARY KEY("course_id","contributor_id");--> statement-breakpoint
ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_uid_course_id_pk" PRIMARY KEY("uid","course_id");--> statement-breakpoint
ALTER TABLE "content"."course_tags" ADD CONSTRAINT "course_tags_course_id_tag_id_pk" PRIMARY KEY("course_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."courses_localized" ADD CONSTRAINT "courses_localized_course_id_language_pk" PRIMARY KEY("course_id","language");--> statement-breakpoint
ALTER TABLE "content"."professor_tags" ADD CONSTRAINT "professor_tags_professor_id_tag_id_pk" PRIMARY KEY("professor_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."professors_localized" ADD CONSTRAINT "professors_localized_professor_id_language_pk" PRIMARY KEY("professor_id","language");--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_uid_course_id_part_chapter_pk" PRIMARY KEY("uid","course_id","part","chapter");--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_quiz_question_id_tag_id_pk" PRIMARY KEY("quiz_question_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_quiz_question_id_language_pk" PRIMARY KEY("quiz_question_id","language");--> statement-breakpoint
ALTER TABLE "content"."resource_tags" ADD CONSTRAINT "resource_tags_resource_id_tag_id_pk" PRIMARY KEY("resource_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tutorial_id_tag_id_pk" PRIMARY KEY("tutorial_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" ADD CONSTRAINT "tutorials_localized_tutorial_id_language_pk" PRIMARY KEY("tutorial_id","language");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_completed_chapters_uid_index" ON "users"."course_completed_chapters" ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_completed_chapters_course_id_index" ON "users"."course_completed_chapters" ("course_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_to_course_parts_fk" FOREIGN KEY ("course_id","part") REFERENCES "content"."course_parts"("course_id","part") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_to_course_chapters_fk" FOREIGN KEY ("course_id","part","chapter") REFERENCES "content"."course_chapters"("course_id","part","chapter") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_to_course_localized_fk" FOREIGN KEY ("course_id","language") REFERENCES "content"."courses_localized"("course_id","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_to_course_parts_localized_fk" FOREIGN KEY ("course_id","part","language") REFERENCES "content"."course_parts_localized"("course_id","part","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_to_course_parts_fk" FOREIGN KEY ("course_id","part") REFERENCES "content"."course_parts"("course_id","part") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_to_course_localized_fk" FOREIGN KEY ("course_id","language") REFERENCES "content"."courses_localized"("course_id","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_questions" ADD CONSTRAINT "quizzes_to_course_chapters_fk" FOREIGN KEY ("course_id","part","chapter") REFERENCES "content"."course_chapters"("course_id","part","chapter") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_username_unique" UNIQUE("username");--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_display_name_unique" UNIQUE("display_name");--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_contributor_id_unique" UNIQUE("contributor_id");--> statement-breakpoint
ALTER TABLE "users"."lud4_public_keys" ADD CONSTRAINT "lud4_public_keys_public_key_unique" UNIQUE("public_key");--> statement-breakpoint
ALTER TABLE "content"."professors" ADD CONSTRAINT "professors_path_unique" UNIQUE("path");--> statement-breakpoint
ALTER TABLE "content"."professors" ADD CONSTRAINT "professors_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "content"."professors" ADD CONSTRAINT "professors_contributor_id_unique" UNIQUE("contributor_id");--> statement-breakpoint
ALTER TABLE "content"."resources" ADD CONSTRAINT "resources_category_path_unique" UNIQUE("category","path");--> statement-breakpoint
ALTER TABLE "content"."tags" ADD CONSTRAINT "tags_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD CONSTRAINT "tutorials_path_unique" UNIQUE("path");--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD CONSTRAINT "tutorials_name_category_unique" UNIQUE("name","category");