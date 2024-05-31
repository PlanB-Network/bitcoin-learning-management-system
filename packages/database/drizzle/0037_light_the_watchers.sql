ALTER TABLE "content"."quiz_questions" DROP CONSTRAINT "quiz_questions_chapter_id_unique";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ALTER COLUMN "chapter_id" SET NOT NULL;