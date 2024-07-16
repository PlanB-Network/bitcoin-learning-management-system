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
