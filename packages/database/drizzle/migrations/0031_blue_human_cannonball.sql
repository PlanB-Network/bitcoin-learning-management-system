ALTER TABLE "users"."exam_answers" DROP CONSTRAINT "exam_answers_question_id_order_pk";--> statement-breakpoint
ALTER TABLE "users"."exam_answers" ADD PRIMARY KEY ("question_id");--> statement-breakpoint
ALTER TABLE "users"."exam_attempts" ADD COLUMN "score" integer DEFAULT 0;