CREATE TABLE IF NOT EXISTS "content"."blog_tags" (
	"blog_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "blog_tags_blog_id_tag_id_pk" PRIMARY KEY("blog_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."blogs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content"."blogs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"path" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(255) NOT NULL,
	"author" varchar(255),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	"date" timestamp,
	CONSTRAINT "blogs_path_unique" UNIQUE("path"),
	CONSTRAINT "blogs_name_category_unique" UNIQUE("name","category")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."blogs_localized" (
	"blog_id" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"raw_content" text NOT NULL,
	CONSTRAINT "blogs_localized_blog_id_language_pk" PRIMARY KEY("blog_id","language")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."blog_tags" ADD CONSTRAINT "blog_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "content"."tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."blogs_localized" ADD CONSTRAINT "blogs_localized_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
