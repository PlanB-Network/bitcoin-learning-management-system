CREATE TABLE IF NOT EXISTS "content"."proofreading" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar(20),
	"tutorial_id" integer,
	"resource_id" integer,
	"language" varchar(10) NOT NULL,
	"last_contribution" timestamp with time zone NOT NULL,
	"urgency" integer,
	"reward" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."proofreading_contributor" (
	"proofreading_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"contributor_id" varchar(20) NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "proofreading_contributor_proofreading_id_language_contributor_id_pk" PRIMARY KEY("proofreading_id","language","contributor_id"),
	CONSTRAINT "proofreading_contributor_proofreading_id_unique" UNIQUE("proofreading_id")
);
--> statement-breakpoint
ALTER TABLE "content"."bet" ADD COLUMN "original_language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."books" ADD COLUMN "original_language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."builders" ADD COLUMN "original_language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."conferences" ADD COLUMN "original_language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "original_language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."glossary_words" ADD COLUMN "original_language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD COLUMN "original_language" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."proofreading" ADD CONSTRAINT "proofreading_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."proofreading" ADD CONSTRAINT "proofreading_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."proofreading" ADD CONSTRAINT "proofreading_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."proofreading_contributor" ADD CONSTRAINT "proofreading_contributor_proofreading_id_proofreading_id_fk" FOREIGN KEY ("proofreading_id") REFERENCES "content"."proofreading"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."proofreading_contributor" ADD CONSTRAINT "proofreading_contributor_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
