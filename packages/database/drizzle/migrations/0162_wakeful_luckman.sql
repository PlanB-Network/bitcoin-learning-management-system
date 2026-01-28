CREATE TABLE "content"."calendar" (
	"resource_id" uuid PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"original_language" varchar(10) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content"."calendar_localized" (
	"resource_id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "calendar_localized_resource_id_language_pk" PRIMARY KEY("resource_id","language")
);
--> statement-breakpoint
ALTER TABLE "content"."calendar" ADD CONSTRAINT "calendar_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."calendar_localized" ADD CONSTRAINT "calendar_localized_resource_id_calendar_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."calendar"("resource_id") ON DELETE cascade ON UPDATE cascade;