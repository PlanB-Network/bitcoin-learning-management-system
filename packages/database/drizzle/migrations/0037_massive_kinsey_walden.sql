CREATE TABLE IF NOT EXISTS "content"."newsletters" (
	"resource_id" integer PRIMARY KEY NOT NULL,
	"id" uuid NOT NULL,
	"level" varchar(255),
	"author" text NOT NULL,
	"link" text,
	"publication_date" text,
	"title" text NOT NULL,
	"tags" text[],
	"contributors" text[],
	"language" varchar(10) NOT NULL,
	CONSTRAINT "newsletters_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."newsletters_localized" (
	"newsletter_id" integer NOT NULL,
	"description" text,
	CONSTRAINT "newsletters_localized_newsletter_id_pk" PRIMARY KEY("newsletter_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."newsletters" ADD CONSTRAINT "newsletters_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."newsletters_localized" ADD CONSTRAINT "newsletters_localized_newsletter_id_newsletters_resource_id_fk" FOREIGN KEY ("newsletter_id") REFERENCES "content"."newsletters"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
