CREATE TABLE IF NOT EXISTS "users"."exam_answers" (
	"question_id" uuid PRIMARY KEY NOT NULL,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."exam_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"language" varchar(10) NOT NULL,
	"finalized" boolean DEFAULT false NOT NULL,
	"score" integer DEFAULT 0,
	"succeeded" boolean DEFAULT false NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."exam_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" uuid NOT NULL,
	"question_id" uuid NOT NULL
);
ALTER TABLE "content"."quiz_questions" ADD COLUMN "id" uuid PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."quiz_answers" ADD COLUMN "quiz_question_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."quiz_answers_localized" ADD COLUMN "quiz_question_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" ADD COLUMN "quiz_question_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" ADD COLUMN "quiz_question_id" uuid NOT NULL;--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "content"."quiz_answers_localized" DROP CONSTRAINT "quiz_answers_localized_to_quiz_answers_fk";
--> statement-breakpoint
ALTER TABLE "content"."quiz_answers" DROP CONSTRAINT "quiz_answers_order_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_answers_localized" DROP CONSTRAINT "quiz_answers_localized_order_language_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" DROP CONSTRAINT "quiz_question_tags_tag_id_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" DROP CONSTRAINT "quiz_questions_localized_language_pk";--> statement-breakpoint
ALTER TABLE "content"."quiz_answers" ADD CONSTRAINT "quiz_answers_quiz_question_id_order_pk" PRIMARY KEY("quiz_question_id","order");--> statement-breakpoint
ALTER TABLE "content"."quiz_answers_localized" ADD CONSTRAINT "quiz_answers_localized_quiz_question_id_order_language_pk" PRIMARY KEY("quiz_question_id","order","language");--> statement-breakpoint
ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_quiz_question_id_tag_id_pk" PRIMARY KEY("quiz_question_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_quiz_question_id_language_pk" PRIMARY KEY("quiz_question_id","language");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."exam_answers" ADD CONSTRAINT "exam_answers_question_id_exam_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "users"."exam_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."exam_attempts" ADD CONSTRAINT "exam_attempts_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."exam_attempts" ADD CONSTRAINT "exam_attempts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."exam_questions" ADD CONSTRAINT "exam_questions_exam_id_exam_attempts_id_fk" FOREIGN KEY ("exam_id") REFERENCES "users"."exam_attempts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."exam_questions" ADD CONSTRAINT "exam_questions_question_id_quiz_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_answers" ADD CONSTRAINT "quiz_answers_quiz_question_id_quiz_questions_id_fk" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_answers_localized" ADD CONSTRAINT "quiz_answers_localized_to_quiz_answers_fk" FOREIGN KEY ("quiz_question_id","order") REFERENCES "content"."quiz_answers"("quiz_question_id","order") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_quiz_question_id_quiz_questions_id_fk" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
