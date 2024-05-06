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
