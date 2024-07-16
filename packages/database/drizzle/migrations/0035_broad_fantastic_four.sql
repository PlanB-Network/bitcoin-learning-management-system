ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_quiz_question_id_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_quiz_question_id_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" ALTER COLUMN "quiz_question_id" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ALTER COLUMN "id" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" ALTER COLUMN "quiz_question_id" SET DATA TYPE varchar(20);