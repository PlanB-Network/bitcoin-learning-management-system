DO $$ BEGIN
 CREATE TYPE "bet_type" AS ENUM('visual content', 'educational content');
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
