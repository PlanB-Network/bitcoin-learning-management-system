ALTER TABLE "content"."bet" DROP CONSTRAINT "bet_resource_id_resources_id_fk";
ALTER TABLE "content"."bet_localized" DROP CONSTRAINT "bet_localized_bet_id_bet_resource_id_fk";
ALTER TABLE "content"."bet_view_url" DROP CONSTRAINT "bet_view_url_bet_id_bet_resource_id_fk";
ALTER TABLE "content"."books" DROP CONSTRAINT "books_resource_id_resources_id_fk";
ALTER TABLE "content"."books_localized" DROP CONSTRAINT "books_localized_book_id_books_resource_id_fk";
ALTER TABLE "content"."conferences" DROP CONSTRAINT "conferences_resource_id_resources_id_fk";
ALTER TABLE "content"."conferences_stages" DROP CONSTRAINT "conferences_stages_conference_id_conferences_resource_id_fk";
ALTER TABLE "content"."glossary_words" DROP CONSTRAINT "glossary_words_resource_id_resources_id_fk";
ALTER TABLE "content"."glossary_words_localized" DROP CONSTRAINT "glossary_words_localized_glossary_word_id_glossary_words_resource_id_fk";
ALTER TABLE "content"."movies" DROP CONSTRAINT "movies_resource_id_resources_id_fk";
ALTER TABLE "content"."newsletters" DROP CONSTRAINT "newsletters_resource_id_resources_id_fk";
ALTER TABLE "content"."podcasts" DROP CONSTRAINT "podcasts_resource_id_resources_id_fk";
ALTER TABLE "content"."projects" DROP CONSTRAINT "projects_resource_id_resources_id_fk";
ALTER TABLE "content"."proofreading" DROP CONSTRAINT "proofreading_resource_id_resources_id_fk";
ALTER TABLE "content"."resource_tags" DROP CONSTRAINT "resource_tags_resource_id_resources_id_fk";
ALTER TABLE "content"."youtube_channels" DROP CONSTRAINT "youtube_channels_resource_id_resources_id_fk";
--
ALTER TABLE "content"."bet" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."bet_localized" ALTER COLUMN "bet_id" SET DATA TYPE uuid USING "bet_id"::uuid;
ALTER TABLE "content"."bet_view_url" ALTER COLUMN "bet_id" SET DATA TYPE uuid USING "bet_id"::uuid;
ALTER TABLE "content"."books" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."books_localized" ALTER COLUMN "book_id" SET DATA TYPE uuid USING "book_id"::uuid;
ALTER TABLE "content"."conferences" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."conferences_stages" ALTER COLUMN "conference_id" SET DATA TYPE uuid USING "conference_id"::uuid;
ALTER TABLE "content"."glossary_words" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."glossary_words_localized" ALTER COLUMN "glossary_word_id" SET DATA TYPE uuid USING "glossary_word_id"::uuid;
ALTER TABLE "content"."movies" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."newsletters" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."podcasts" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."projects" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."proofreading" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."resource_tags" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
ALTER TABLE "content"."youtube_channels" ALTER COLUMN "resource_id" SET DATA TYPE uuid USING "resource_id"::uuid;
--
ALTER TABLE "content"."resources" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "content"."resources" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;
--
ALTER TABLE "content"."bet" ADD CONSTRAINT "bet_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."bet_localized" ADD CONSTRAINT "bet_localized_bet_id_bet_resource_id_fk" FOREIGN KEY ("bet_id") REFERENCES "content"."bet"("resource_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."bet_view_url" ADD CONSTRAINT "bet_view_url_bet_id_bet_resource_id_fk" FOREIGN KEY ("bet_id") REFERENCES "content"."bet"("resource_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."books" ADD CONSTRAINT "books_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."books_localized" ADD CONSTRAINT "books_localized_book_id_books_resource_id_fk" FOREIGN KEY ("book_id") REFERENCES "content"."books"("resource_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."conferences" ADD CONSTRAINT "conferences_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."conferences_stages" ADD CONSTRAINT "conferences_stages_conference_id_conferences_resource_id_fk" FOREIGN KEY ("conference_id") REFERENCES "content"."conferences"("resource_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."glossary_words" ADD CONSTRAINT "glossary_words_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."glossary_words_localized" ADD CONSTRAINT "glossary_words_localized_glossary_word_id_glossary_words_resource_id_fk" FOREIGN KEY ("glossary_word_id") REFERENCES "content"."glossary_words"("resource_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."movies" ADD CONSTRAINT "movies_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."newsletters" ADD CONSTRAINT "newsletters_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."podcasts" ADD CONSTRAINT "podcasts_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."projects" ADD CONSTRAINT "projects_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."proofreading" ADD CONSTRAINT "proofreading_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."resource_tags" ADD CONSTRAINT "resource_tags_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."youtube_channels" ADD CONSTRAINT "youtube_channels_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;
