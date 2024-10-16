CREATE TABLE IF NOT EXISTS "content"."quiz_answers" (
	"order" integer NOT NULL,
	"correct" boolean NOT NULL,
	CONSTRAINT "quiz_answers_order_pk" PRIMARY KEY("order")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."quiz_answers_localized" (
	"order" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "quiz_answers_localized_order_language_pk" PRIMARY KEY("order","language")
);
--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_quiz_question_id_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_quiz_question_id_quiz_questions_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_quiz_question_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_quiz_question_id_language_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_tag_id_pk" PRIMARY KEY("tag_id");--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_language_pk" PRIMARY KEY("language");--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ADD COLUMN "course_id" varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" ADD COLUMN "disabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD COLUMN "certificate_name" varchar(255);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_answers_localized" ADD CONSTRAINT "quiz_answers_localized_to_quiz_answers_fk" FOREIGN KEY ("order") REFERENCES "content"."quiz_answers"("order") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_questions" ADD CONSTRAINT "quiz_questions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP COLUMN IF EXISTS "quiz_question_id";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP COLUMN IF EXISTS "quiz_question_id";