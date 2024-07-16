ALTER TABLE "users"."lud4_public_keys" DROP CONSTRAINT "lud4_public_keys_uid_fkey";
--> statement-breakpoint
ALTER TABLE "content"."books" DROP CONSTRAINT "books_resource_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."builders" DROP CONSTRAINT "builders_resource_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."podcasts" DROP CONSTRAINT "podcasts_resource_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."professors" DROP CONSTRAINT "professors_contributor_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."tutorial_credits" DROP CONSTRAINT "tutorial_credits_tutorial_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."tutorial_credits" DROP CONSTRAINT "tutorial_credits_contributor_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."resource_tags" DROP CONSTRAINT "resource_tags_resource_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."resource_tags" DROP CONSTRAINT "resource_tags_tag_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."course_parts" DROP CONSTRAINT "course_parts_course_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."course_tags" DROP CONSTRAINT "course_tags_course_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."course_tags" DROP CONSTRAINT "course_tags_tag_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" DROP CONSTRAINT "tutorial_tags_tutorial_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" DROP CONSTRAINT "tutorial_tags_tag_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_quiz_question_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_tag_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."professor_tags" DROP CONSTRAINT "professor_tags_professor_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."professor_tags" DROP CONSTRAINT "professor_tags_tag_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."course_professors" DROP CONSTRAINT "course_professors_course_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."course_professors" DROP CONSTRAINT "course_professors_contributor_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."builders_localized" DROP CONSTRAINT "builders_localized_builder_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."professors_localized" DROP CONSTRAINT "professors_localized_professor_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" DROP CONSTRAINT "tutorials_localized_tutorial_id_fkey";
--> statement-breakpoint
ALTER TABLE "users"."course_completed_chapters" DROP CONSTRAINT "course_completed_chapters_uid_fkey";
--> statement-breakpoint
ALTER TABLE "users"."course_completed_chapters" DROP CONSTRAINT "course_completed_chapters_course_id_fkey";
--> statement-breakpoint
ALTER TABLE "users"."course_progress" DROP CONSTRAINT "course_progress_uid_fkey";
--> statement-breakpoint
ALTER TABLE "users"."course_progress" DROP CONSTRAINT "course_progress_course_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."courses_localized" DROP CONSTRAINT "courses_localized_course_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_quiz_question_id_fkey";
--> statement-breakpoint
ALTER TABLE "users"."quiz_attempts" DROP CONSTRAINT "quiz_attempts_uid_fkey";
--> statement-breakpoint
ALTER TABLE "users"."course_payment" DROP CONSTRAINT "course_payment_uid_fkey";
--> statement-breakpoint
ALTER TABLE "users"."course_payment" DROP CONSTRAINT "course_payment_course_id_fkey";
--> statement-breakpoint
ALTER TABLE "content"."books_localized" DROP CONSTRAINT "books_localized_book_id_fkey";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."lud4_public_keys" ADD CONSTRAINT "lud4_public_keys_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."books" ADD CONSTRAINT "books_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."builders" ADD CONSTRAINT "builders_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."podcasts" ADD CONSTRAINT "podcasts_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professors" ADD CONSTRAINT "professors_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_credits" ADD CONSTRAINT "tutorial_credits_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_credits" ADD CONSTRAINT "tutorial_credits_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."resource_tags" ADD CONSTRAINT "resource_tags_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."resource_tags" ADD CONSTRAINT "resource_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_tags" ADD CONSTRAINT "course_tags_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_tags" ADD CONSTRAINT "course_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_quiz_question_id_quiz_questions_id_fk" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professor_tags" ADD CONSTRAINT "professor_tags_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professor_tags" ADD CONSTRAINT "professor_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."builders_localized" ADD CONSTRAINT "builders_localized_builder_id_builders_resource_id_fk" FOREIGN KEY ("builder_id") REFERENCES "content"."builders"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professors_localized" ADD CONSTRAINT "professors_localized_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorials_localized" ADD CONSTRAINT "tutorials_localized_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_completed_chapters" ADD CONSTRAINT "course_completed_chapters_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_completed_chapters" ADD CONSTRAINT "course_completed_chapters_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."courses_localized" ADD CONSTRAINT "courses_localized_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_quiz_question_id_quiz_questions_id_fk" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."books_localized" ADD CONSTRAINT "books_localized_book_id_books_resource_id_fk" FOREIGN KEY ("book_id") REFERENCES "content"."books"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
