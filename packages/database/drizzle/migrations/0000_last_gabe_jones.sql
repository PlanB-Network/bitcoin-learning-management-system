CREATE SCHEMA "content";
--> statement-breakpoint
CREATE SCHEMA "users";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."bet_type" AS ENUM('visual content', 'educational content');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."event_type" AS ENUM('conference', 'workshop', 'course', 'lecture', 'exam', 'meetup');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."token_type" AS ENUM('validate_email', 'reset_password', 'login');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."bet" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"type" "bet_type" NOT NULL,
	"builder" text,
	"download_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."bet_localized" (
	"bet_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "bet_localized_bet_id_language_pk" PRIMARY KEY("bet_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."bet_view_url" (
	"bet_id" integer NOT NULL,
	"language" text NOT NULL,
	"view_url" text NOT NULL,
	CONSTRAINT "bet_view_url_bet_id_language_pk" PRIMARY KEY("bet_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."books" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"level" varchar(255),
	"author" text NOT NULL,
	"website_url" text
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
	CONSTRAINT "books_localized_book_id_language_pk" PRIMARY KEY("book_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."builders" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" varchar(255) NOT NULL,
	"languages" varchar(255)[],
	"address_line_1" text,
	"address_line_2" text,
	"address_line_3" text,
	"website_url" text,
	"twitter_url" text,
	"github_url" text,
	"nostr" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."builders_localized" (
	"builder_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"description" text,
	CONSTRAINT "builders_localized_builder_id_language_pk" PRIMARY KEY("builder_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."conferences_stages_videos" (
	"video_id" varchar PRIMARY KEY NOT NULL,
	"stage_id" varchar NOT NULL,
	"name" text NOT NULL,
	"raw_content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."conferences" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"year" text NOT NULL,
	"builder" varchar(255),
	"languages" varchar(255)[],
	"location" text NOT NULL,
	"website_url" text,
	"twitter_url" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."conferences_stages" (
	"stage_id" varchar PRIMARY KEY NOT NULL,
	"conference_id" integer NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."contributors" (
	"id" varchar(20) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_chapters" (
	"course_id" varchar(20) NOT NULL,
	"chapter_index" integer NOT NULL,
	"part_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_chapters_chapter_id_pk" PRIMARY KEY("chapter_id"),
	CONSTRAINT "course_chapters_chapter_id_unique" UNIQUE("chapter_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_chapters_localized" (
	"course_id" varchar(20) NOT NULL,
	"chapter_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"release_place" varchar(50),
	"is_online" boolean DEFAULT false NOT NULL,
	"is_in_person" boolean DEFAULT false NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"timezone" text,
	"address_line_1" text,
	"address_line_2" text,
	"address_line_3" text,
	"live_url" text,
	"chat_url" text,
	"available_seats" integer,
	"remaining_seats" integer,
	"live_language" text,
	"title" text NOT NULL,
	"sections" text[] NOT NULL,
	"raw_content" text NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_chapters_localized_course_id_chapter_id_language_pk" PRIMARY KEY("course_id","chapter_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_chapters_localized_professors" (
	"course_id" varchar(20) NOT NULL,
	"chapter_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"contributor_id" varchar(20) NOT NULL,
	CONSTRAINT "course_chapters_localized_professors_contributor_id_course_id_chapter_id_language_pk" PRIMARY KEY("contributor_id","course_id","chapter_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_parts" (
	"course_id" varchar(20) NOT NULL,
	"part_index" integer NOT NULL,
	"part_id" uuid NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_parts_course_id_part_id_pk" PRIMARY KEY("course_id","part_id"),
	CONSTRAINT "course_parts_part_id_unique" UNIQUE("part_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_parts_localized" (
	"course_id" varchar(20) NOT NULL,
	"part_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_parts_localized_course_id_part_id_language_pk" PRIMARY KEY("course_id","part_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_professors" (
	"course_id" varchar(20) NOT NULL,
	"contributor_id" varchar(20) NOT NULL,
	CONSTRAINT "course_professors_course_id_contributor_id_pk" PRIMARY KEY("course_id","contributor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."course_tags" (
	"course_id" varchar(20) NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "course_tags_course_id_tag_id_pk" PRIMARY KEY("course_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."courses" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"level" varchar(255) NOT NULL,
	"hours" double precision NOT NULL,
	"topic" text NOT NULL,
	"subtopic" text NOT NULL,
	"requires_payment" boolean DEFAULT false NOT NULL,
	"paid_price_dollars" integer,
	"paid_description" text,
	"paid_video_link" text,
	"paid_start_date" timestamp with time zone,
	"paid_end_date" timestamp with time zone,
	"contact" varchar(255),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."courses_localized" (
	"course_id" varchar(20) NOT NULL,
	"language" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"goal" text NOT NULL,
	"objectives" text[] NOT NULL,
	"raw_description" text NOT NULL,
	CONSTRAINT "courses_localized_course_id_language_pk" PRIMARY KEY("course_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."event_languages" (
	"event_id" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	CONSTRAINT "event_languages_event_id_language_pk" PRIMARY KEY("event_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."event_locations" (
	"place_id" integer NOT NULL,
	"name" text PRIMARY KEY NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."event_tags" (
	"event_id" varchar(100) NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "event_tags_event_id_tag_id_pk" PRIMARY KEY("event_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."events" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"type" "event_type",
	"name" text,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"timezone" text,
	"price_dollars" integer,
	"available_seats" integer,
	"remaining_seats" integer,
	"book_online" boolean DEFAULT false,
	"book_in_person" boolean DEFAULT false,
	"address_line_1" text,
	"address_line_2" text,
	"address_line_3" text,
	"builder" varchar(255),
	"website_url" text,
	"replay_url" text,
	"live_url" text,
	"chat_url" text,
	"asset_url" text,
	"raw_description" text,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "events_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."glossary_words" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"original_word" text NOT NULL,
	"file_name" text NOT NULL,
	"related_words" varchar(255)[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."glossary_words_localized" (
	"glossary_word_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"term" text NOT NULL,
	"definition" text NOT NULL,
	CONSTRAINT "glossary_words_localized_glossary_word_id_language_pk" PRIMARY KEY("glossary_word_id","language")
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
CREATE TABLE IF NOT EXISTS "content"."professor_tags" (
	"professor_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "professor_tags_professor_id_tag_id_pk" PRIMARY KEY("professor_id","tag_id")
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
	CONSTRAINT "professors_path_unique" UNIQUE("path"),
	CONSTRAINT "professors_name_unique" UNIQUE("name"),
	CONSTRAINT "professors_contributor_id_unique" UNIQUE("contributor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."professors_localized" (
	"professor_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"bio" text,
	"short_bio" text,
	CONSTRAINT "professors_localized_professor_id_language_pk" PRIMARY KEY("professor_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."quiz_question_tags" (
	"quiz_question_id" varchar(20) NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "quiz_question_tags_quiz_question_id_tag_id_pk" PRIMARY KEY("quiz_question_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."quiz_questions" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"chapter_id" uuid NOT NULL,
	"difficulty" varchar(255) NOT NULL,
	"author" varchar(255),
	"duration" integer,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."quiz_questions_localized" (
	"quiz_question_id" varchar(20) NOT NULL,
	"language" varchar(10) NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"wrong_answers" text[] NOT NULL,
	"explanation" text,
	CONSTRAINT "quiz_questions_localized_quiz_question_id_language_pk" PRIMARY KEY("quiz_question_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."resource_tags" (
	"resource_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "resource_tags_resource_id_tag_id_pk" PRIMARY KEY("resource_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(255) NOT NULL,
	"path" varchar(255) NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resources_category_path_unique" UNIQUE("category","path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name")
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
CREATE TABLE IF NOT EXISTS "content"."tutorial_tags" (
	"tutorial_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "tutorial_tags_tutorial_id_tag_id_pk" PRIMARY KEY("tutorial_id","tag_id")
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
	CONSTRAINT "tutorials_path_unique" UNIQUE("path"),
	CONSTRAINT "tutorials_name_category_unique" UNIQUE("name","category")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."tutorials_localized" (
	"tutorial_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"raw_content" text NOT NULL,
	CONSTRAINT "tutorials_localized_tutorial_id_language_pk" PRIMARY KEY("tutorial_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."coupon_code" (
	"code" varchar(20) PRIMARY KEY NOT NULL,
	"item_id" varchar(100) NOT NULL,
	"reduction_percentage" integer,
	"is_unique" boolean DEFAULT true NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"uid" uuid,
	"time_used" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"type" "token_type" NOT NULL,
	"data" varchar(255),
	"expires_at" timestamp NOT NULL,
	"consumed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."accounts" (
	"uid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"picture" uuid,
	"email" varchar(255),
	"password_hash" varchar(255),
	"contributor_id" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_username_unique" UNIQUE("username"),
	CONSTRAINT "accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "accounts_contributor_id_unique" UNIQUE("contributor_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."course_payment" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"payment_status" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"payment_id" varchar(255) NOT NULL,
	"invoice_url" varchar(255),
	"coupon_code" varchar(20),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_payment_uid_course_id_payment_id_pk" PRIMARY KEY("uid","course_id","payment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."course_progress" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"completed_chapters_count" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "course_progress_uid_course_id_pk" PRIMARY KEY("uid","course_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."course_user_chapter" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"chapter_id" uuid NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"booked" boolean DEFAULT false,
	CONSTRAINT "course_user_chapter_uid_course_id_chapter_id_pk" PRIMARY KEY("uid","course_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."event_payment" (
	"uid" uuid NOT NULL,
	"event_id" varchar(100) NOT NULL,
	"with_physical" boolean DEFAULT false,
	"payment_status" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"payment_id" varchar(255) NOT NULL,
	"invoice_url" varchar(255),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_payment_uid_event_id_payment_id_pk" PRIMARY KEY("uid","event_id","payment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"data" "bytea",
	"s3" boolean DEFAULT false NOT NULL,
	"s3_key" varchar(255),
	"checksum" varchar(64) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mimetype" varchar(255) NOT NULL,
	"filesize" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."lud4_public_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"uid" uuid NOT NULL,
	"public_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lud4_public_keys_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."quiz_attempts" (
	"uid" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"questions_count" integer NOT NULL,
	"correct_answers_count" integer NOT NULL,
	"done_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "quiz_attempts_uid_chapter_id_pk" PRIMARY KEY("uid","chapter_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."user_event" (
	"uid" uuid NOT NULL,
	"event_id" varchar(100) NOT NULL,
	"booked" boolean DEFAULT false,
	"with_physical" boolean DEFAULT false,
	CONSTRAINT "user_event_uid_event_id_pk" PRIMARY KEY("uid","event_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."bet" ADD CONSTRAINT "bet_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."bet_localized" ADD CONSTRAINT "bet_localized_bet_id_bet_resource_id_fk" FOREIGN KEY ("bet_id") REFERENCES "content"."bet"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."bet_view_url" ADD CONSTRAINT "bet_view_url_bet_id_bet_resource_id_fk" FOREIGN KEY ("bet_id") REFERENCES "content"."bet"("resource_id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "content"."books_localized" ADD CONSTRAINT "books_localized_book_id_books_resource_id_fk" FOREIGN KEY ("book_id") REFERENCES "content"."books"("resource_id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "content"."builders_localized" ADD CONSTRAINT "builders_localized_builder_id_builders_resource_id_fk" FOREIGN KEY ("builder_id") REFERENCES "content"."builders"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."conferences_stages_videos" ADD CONSTRAINT "conferences_stages_videos_stage_id_conferences_stages_stage_id_fk" FOREIGN KEY ("stage_id") REFERENCES "content"."conferences_stages"("stage_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."conferences" ADD CONSTRAINT "conferences_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."conferences_stages" ADD CONSTRAINT "conferences_stages_conference_id_conferences_resource_id_fk" FOREIGN KEY ("conference_id") REFERENCES "content"."conferences"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_to_course_parts_fk" FOREIGN KEY ("course_id","part_id") REFERENCES "content"."course_parts"("course_id","part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized" ADD CONSTRAINT "course_chapters_localized_to_course_localized_fk" FOREIGN KEY ("course_id","language") REFERENCES "content"."courses_localized"("course_id","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_to_course_parts_fk" FOREIGN KEY ("course_id","part_id") REFERENCES "content"."course_parts"("course_id","part_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_parts_localized" ADD CONSTRAINT "course_parts_localized_to_course_localized_fk" FOREIGN KEY ("course_id","language") REFERENCES "content"."courses_localized"("course_id","language") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
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
 ALTER TABLE "content"."course_tags" ADD CONSTRAINT "course_tags_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
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
 ALTER TABLE "content"."courses_localized" ADD CONSTRAINT "courses_localized_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."event_languages" ADD CONSTRAINT "event_languages_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."event_tags" ADD CONSTRAINT "event_tags_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."event_tags" ADD CONSTRAINT "event_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."glossary_words" ADD CONSTRAINT "glossary_words_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."glossary_words_localized" ADD CONSTRAINT "glossary_words_localized_glossary_word_id_glossary_words_resource_id_fk" FOREIGN KEY ("glossary_word_id") REFERENCES "content"."glossary_words"("resource_id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "content"."professors" ADD CONSTRAINT "professors_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "content"."quiz_questions" ADD CONSTRAINT "quiz_questions_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "content"."tutorials_localized" ADD CONSTRAINT "tutorials_localized_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."coupon_code" ADD CONSTRAINT "coupon_code_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."tokens" ADD CONSTRAINT "tokens_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_coupon_code_coupon_code_code_fk" FOREIGN KEY ("coupon_code") REFERENCES "content"."coupon_code"("code") ON DELETE no action ON UPDATE no action;
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
 ALTER TABLE "users"."course_progress" ADD CONSTRAINT "course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."event_payment" ADD CONSTRAINT "event_payment_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."event_payment" ADD CONSTRAINT "event_payment_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."files" ADD CONSTRAINT "files_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."lud4_public_keys" ADD CONSTRAINT "lud4_public_keys_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "users"."quiz_attempts" ADD CONSTRAINT "quiz_attempts_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."user_event" ADD CONSTRAINT "user_event_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."user_event" ADD CONSTRAINT "user_event_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_user_chapter_uid_index" ON "users"."course_user_chapter" USING btree ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_user_chapter_course_id_index" ON "users"."course_user_chapter" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_event_uid_index" ON "users"."user_event" USING btree ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_event_event_id_index" ON "users"."user_event" USING btree ("event_id");