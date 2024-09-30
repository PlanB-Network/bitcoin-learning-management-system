ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_quiz_question_id_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_quiz_question_id_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_quiz_question_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_quiz_question_id_language_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_tag_id_pk" PRIMARY KEY("tag_id");--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_language_pk" PRIMARY KEY("language");--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD COLUMN "certificate_name" varchar(255);--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP COLUMN IF EXISTS "quiz_question_id";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP COLUMN IF EXISTS "quiz_question_id";