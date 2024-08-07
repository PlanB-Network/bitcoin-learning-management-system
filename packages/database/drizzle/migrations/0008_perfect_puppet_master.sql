CREATE TABLE IF NOT EXISTS "users"."course_review" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"general" integer DEFAULT 0 NOT NULL,
	"length" integer DEFAULT 0 NOT NULL,
	"difficulty" integer DEFAULT 0 NOT NULL,
	"quality" integer DEFAULT 0 NOT NULL,
	"faithful" integer DEFAULT 0 NOT NULL,
	"recommand" integer DEFAULT 0 NOT NULL,
	"public_comment" text,
	"teacher_comment" text,
	"admin_comment" text,
	CONSTRAINT "course_review_uid_course_id_pk" PRIMARY KEY("uid","course_id")
);
--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "is_course_review" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "is_course_exam" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "is_course_conclusion" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_review" ADD CONSTRAINT "course_review_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_review" ADD CONSTRAINT "course_review_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
