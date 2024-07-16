DO $$ BEGIN
 CREATE TYPE "event_type" AS ENUM('conference');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."event_languages" (
	"event_id" varchar(50) NOT NULL,
	"language" varchar(10) NOT NULL,
	CONSTRAINT "event_languages_event_id_language_pk" PRIMARY KEY("event_id","language")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."event_tags" (
	"event_id" varchar(50) NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "event_tags_event_id_tag_id_pk" PRIMARY KEY("event_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "content"."events" RENAME COLUMN "title" TO "name";--> statement-breakpoint
ALTER TABLE "content"."events" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."events" ALTER COLUMN "start_date" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "content"."events" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "type" "event_type";--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "end_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "available_seats" integer;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "is_online" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "is_in_person" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "builder" varchar(255);--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "replay_url" text;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "live_url" text;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "raw_description" text;--> statement-breakpoint
ALTER TABLE "content"."events" DROP COLUMN IF EXISTS "duration";--> statement-breakpoint
ALTER TABLE "users"."course_payment" DROP COLUMN IF EXISTS "with_physical";--> statement-breakpoint
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
