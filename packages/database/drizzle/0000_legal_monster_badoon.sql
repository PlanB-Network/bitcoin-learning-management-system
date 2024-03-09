-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE SCHEMA IF NOT EXISTS "users";
--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "content";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."accounts" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"email" varchar(255),
	"password_hash" varchar(255),
	"contributor_id" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_username_key" UNIQUE("username"),
	CONSTRAINT "accounts_display_name_key" UNIQUE("display_name"),
	CONSTRAINT "accounts_email_key" UNIQUE("email"),
	CONSTRAINT "accounts_contributor_id_key" UNIQUE("contributor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."lud4_public_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"public_key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lud4_public_keys_public_key_key" UNIQUE("public_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "tags_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."books" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"level" varchar(255),
	"author" text NOT NULL,
	"website_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."builders" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" varchar(255) NOT NULL,
	"website_url" text,
	"twitter_url" text,
	"github_url" text,
	"nostr" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255) NOT NULL,
	"path" varchar(255) NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resources_category_path_key" UNIQUE("category","path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."podcasts" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"language" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"host" text NOT NULL,
	"description" text,
	"website_url" text,
	"twitter_url" text,
	"podcast_url" text,
	"nostr" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."quiz_questions" (
	"id" integer PRIMARY KEY NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"chapter" integer NOT NULL,
	"difficulty" varchar(255) NOT NULL,
	"author" varchar(255),
	"duration" integer,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."contributors" (
	"id" varchar(20) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."professors" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"company" varchar(255),
	"affiliations" varchar(255)[],
	"contributor_id" varchar(20) NOT NULL,
	"website_url" text,
	"twitter_url" text,
	"github_url" text,
	"nostr" text,
	"lightning_address" text,
	"lnurl_pay" text,
	"paynym" text,
	"silent_payment" text,
	"tips_url" text,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "professors_path_key" UNIQUE("path"),
	CONSTRAINT "professors_name_key" UNIQUE("name"),
	CONSTRAINT "professors_contributor_id_key" UNIQUE("contributor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."tutorial_credits" (
	"tutorial_id" integer PRIMARY KEY NOT NULL,
	"contributor_id" varchar(20),
	"name" varchar(255),
	"link" text,
	"lightning_address" text,
	"lnurl_pay" text,
	"paynym" text,
	"silent_payment" text,
	"tips_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."tutorials" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"subcategory" varchar(255),
	"level" varchar(255) NOT NULL,
	"builder" varchar(255),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tutorials_path_key" UNIQUE("path"),
	CONSTRAINT "tutorials_name_category_key" UNIQUE("name","category")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."courses" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"level" varchar(255) NOT NULL,
	"hours" double precision NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	"requires_payment" boolean DEFAULT false NOT NULL,
	"paid_price_euros" integer,
	"paid_description" text,
	"paid_video_link" text,
	"paid_start_date" timestamp,
	"paid_end_date" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."resource_tags" (
	"resource_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "resource_tags_pkey" PRIMARY KEY("resource_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_parts" (
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	CONSTRAINT "course_parts_pkey" PRIMARY KEY("course_id","part")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_tags" (
	"course_id" varchar(20) NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "course_tags_pkey" PRIMARY KEY("course_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."tutorial_tags" (
	"tutorial_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "tutorial_tags_pkey" PRIMARY KEY("tutorial_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."quiz_question_tags" (
	"quiz_question_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "quiz_question_tags_pkey" PRIMARY KEY("quiz_question_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."professor_tags" (
	"professor_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "professor_tags_pkey" PRIMARY KEY("professor_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_professors" (
	"course_id" varchar(20) NOT NULL,
	"contributor_id" varchar(20) NOT NULL,
	CONSTRAINT "course_professors_pkey" PRIMARY KEY("course_id","contributor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."builders_localized" (
	"builder_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"description" text,
	CONSTRAINT "builders_localized_pkey" PRIMARY KEY("builder_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_chapters" (
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"chapter" integer NOT NULL,
	CONSTRAINT "course_chapters_pkey" PRIMARY KEY("course_id","part","chapter")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_parts_localized" (
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "course_parts_localized_pkey" PRIMARY KEY("course_id","part","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."professors_localized" (
	"professor_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"bio" text,
	"short_bio" text,
	CONSTRAINT "professors_localized_pkey" PRIMARY KEY("professor_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."tutorials_localized" (
	"tutorial_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"raw_content" text NOT NULL,
	CONSTRAINT "tutorials_localized_pkey" PRIMARY KEY("tutorial_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."course_completed_chapters" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"chapter" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_completed_chapters_pkey" PRIMARY KEY("uid","course_id","part","chapter")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."course_progress" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"completed_chapters_count" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "course_progress_pkey" PRIMARY KEY("uid","course_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."courses_localized" (
	"course_id" varchar(20) NOT NULL,
	"language" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"goal" text NOT NULL,
	"objectives" text[] NOT NULL,
	"raw_description" text NOT NULL,
	CONSTRAINT "courses_localized_pkey" PRIMARY KEY("course_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."quiz_questions_localized" (
	"quiz_question_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"wrong_answers" text[] NOT NULL,
	"explanation" text,
	CONSTRAINT "quiz_questions_localized_pkey" PRIMARY KEY("quiz_question_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_chapters_localized" (
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"chapter" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"sections" text[] NOT NULL,
	"raw_content" text NOT NULL,
	CONSTRAINT "course_chapters_localized_pkey" PRIMARY KEY("course_id","part","chapter","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."quiz_attempts" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"chapter" integer NOT NULL,
	"questions_count" integer NOT NULL,
	"correct_answers_count" integer NOT NULL,
	"done_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY("uid","course_id","part","chapter")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."course_payment" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"payment_status" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"payment_id" varchar(255) NOT NULL,
	"invoice_url" varchar(255),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_payment_pkey" PRIMARY KEY("uid","course_id","payment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."books_localized" (
	"book_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"original" boolean NOT NULL,
	"title" text NOT NULL,
	"translator" text,
	"description" text,
	"publisher" varchar(255),
	"publication_year" integer,
	"cover" text,
	"summary_text" text,
	"summary_contributor_id" varchar(20),
	"shop_url" text,
	"download_url" text,
	CONSTRAINT "books_localized_pkey" PRIMARY KEY("book_id","language")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_course_completed_chapters_account" ON "users"."course_completed_chapters" ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_course_completed_chapters_course" ON "users"."course_completed_chapters" ("course_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."lud4_public_keys" ADD CONSTRAINT "lud4_public_keys_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."books" ADD CONSTRAINT "books_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."builders" ADD CONSTRAINT "builders_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."podcasts" ADD CONSTRAINT "podcasts_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_questions" ADD CONSTRAINT "fk_quizzes_to_course_chapters" FOREIGN KEY ("course_id","part","chapter") REFERENCES "content"."course_chapters"("course_id","part","chapter") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professors" ADD CONSTRAINT "professors_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_credits" ADD CONSTRAINT "tutorial_credits_tutorial_id_fkey" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_credits" ADD CONSTRAINT "tutorial_credits_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."resource_tags" ADD CONSTRAINT "resource_tags_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."resource_tags" ADD CONSTRAINT "resource_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_tags" ADD CONSTRAINT "course_tags_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_tags" ADD CONSTRAINT "course_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tutorial_id_fkey" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_question_tags" ADD CONSTRAINT "quiz_question_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professor_tags" ADD CONSTRAINT "professor_tags_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professor_tags" ADD CONSTRAINT "professor_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."builders_localized" ADD CONSTRAINT "builders_localized_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "content"."builders"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "fk_course_chapters_to_course_parts" FOREIGN KEY ("course_id","part") REFERENCES "content"."course_parts"("course_id","part") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "fk_course_parts_localized_to_course_parts" FOREIGN KEY ("course_id","part") REFERENCES "content"."course_parts"("course_id","part") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "fk_course_parts_localized_to_course_localized" FOREIGN KEY ("course_id","language") REFERENCES "content"."courses_localized"("course_id","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."professors_localized" ADD CONSTRAINT "professors_localized_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorials_localized" ADD CONSTRAINT "tutorials_localized_tutorial_id_fkey" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_completed_chapters" ADD CONSTRAINT "course_completed_chapters_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_completed_chapters" ADD CONSTRAINT "course_completed_chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."courses_localized" ADD CONSTRAINT "courses_localized_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."quiz_questions_localized" ADD CONSTRAINT "quiz_questions_localized_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "content"."quiz_questions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "fk_course_chapters_localized_to_course_chapters" FOREIGN KEY ("course_id","part","chapter") REFERENCES "content"."course_chapters"("course_id","part","chapter") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "fk_course_chapters_localized_to_course_localized" FOREIGN KEY ("course_id","language") REFERENCES "content"."courses_localized"("course_id","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "fk_course_chapters_localized_to_course_parts_localized" FOREIGN KEY ("course_id","part","language") REFERENCES "content"."course_parts_localized"("course_id","part","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_uid_fkey" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."books_localized" ADD CONSTRAINT "books_localized_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "content"."books"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
