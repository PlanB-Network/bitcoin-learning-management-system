ALTER TABLE "content"."bet" DROP CONSTRAINT "bet_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."bet_localized" DROP CONSTRAINT "bet_localized_bet_id_bet_resource_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."bet_view_url" DROP CONSTRAINT "bet_view_url_bet_id_bet_resource_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."books" DROP CONSTRAINT "books_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."books_localized" DROP CONSTRAINT "books_localized_book_id_books_resource_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."conferences" DROP CONSTRAINT "conferences_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."conferences_stages" DROP CONSTRAINT "conferences_stages_conference_id_conferences_resource_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."glossary_words" DROP CONSTRAINT "glossary_words_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."glossary_words_localized" DROP CONSTRAINT "glossary_words_localized_glossary_word_id_glossary_words_resource_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."movies" DROP CONSTRAINT "movies_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."newsletters" DROP CONSTRAINT "newsletters_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."podcasts" DROP CONSTRAINT "podcasts_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."projects" DROP CONSTRAINT "projects_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."proofreading" DROP CONSTRAINT "proofreading_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."resource_tags" DROP CONSTRAINT "resource_tags_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."youtube_channels" DROP CONSTRAINT "youtube_channels_resource_id_resources_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."resources" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."bet" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."bet_localized" ALTER COLUMN "bet_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."bet_view_url" ALTER COLUMN "bet_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."books" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."books_localized" ALTER COLUMN "book_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."conferences" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."conferences_stages" ALTER COLUMN "conference_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."glossary_words" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."glossary_words_localized" ALTER COLUMN "glossary_word_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."movies" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."newsletters" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."podcasts" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."projects" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."proofreading" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."resource_tags" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);--> statement-breakpoint
/*
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'content'
                AND table_name = 'resources'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually

    Hope to release this update as soon as possible
*/

-- ALTER TABLE "resources" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "content"."youtube_channels" ALTER COLUMN "resource_id" SET DATA TYPE varchar(100);
