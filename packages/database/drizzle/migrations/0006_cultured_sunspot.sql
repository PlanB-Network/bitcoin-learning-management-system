CREATE TABLE IF NOT EXISTS "content"."course_chapters_localized_professors" (
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"chapter" integer NOT NULL,
	"language" varchar(10) NOT NULL,
	"contributor_id" varchar(20) NOT NULL,
	CONSTRAINT "course_chapters_localized_professors_contributor_id_course_id_part_chapter_language_pk" PRIMARY KEY("contributor_id","course_id","part","chapter","language")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_contributor_id_contributors_id_fk" FOREIGN KEY ("contributor_id") REFERENCES "content"."contributors"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
