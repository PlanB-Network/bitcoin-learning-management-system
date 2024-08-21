CREATE TABLE IF NOT EXISTS "content"."legals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content"."legals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"path" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legals_path_unique" UNIQUE("path"),
	CONSTRAINT "legals_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."legals_localized" (
	"id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"raw_content" text NOT NULL,
	CONSTRAINT "legals_localized_id_language_pk" PRIMARY KEY("id","language")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."legals_localized" ADD CONSTRAINT "legals_localized_id_legals_id_fk" FOREIGN KEY ("id") REFERENCES "content"."legals"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
