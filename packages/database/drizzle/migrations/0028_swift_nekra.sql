ALTER TABLE "content"."quiz_questions" ADD COLUMN "id" uuid PRIMARY KEY NOT NULL;
ALTER TABLE "content"."quiz_question_tags" ADD COLUMN "quiz_question_id" uuid NOT NULL;
ALTER TABLE "content"."quiz_questions_localized" ADD COLUMN "quiz_question_id" uuid NOT NULL;

ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_tag_id_pk";
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_language_pk";

ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_quiz_question_id_tag_id_pk" PRIMARY KEY("quiz_question_id","tag_id");
ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_quiz_question_id_language_pk" PRIMARY KEY("quiz_question_id","language");

DO $$ BEGIN
  ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_quiz_question_id_quiz_questions_id_fk" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_quiz_question_id_quiz_questions_id_fk" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
