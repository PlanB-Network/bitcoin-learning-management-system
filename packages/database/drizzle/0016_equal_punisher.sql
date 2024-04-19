CREATE TABLE IF NOT EXISTS "users"."course_user_chapter" (
	"uid" uuid NOT NULL,
	"course_id" varchar(20) NOT NULL,
	"part" integer NOT NULL,
	"chapter" integer NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"booked" boolean DEFAULT false,
	CONSTRAINT "course_user_chapter_uid_course_id_part_chapter_pk" PRIMARY KEY("uid","course_id","part","chapter")
);
 --> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_user_chapter_uid_index" ON "users"."course_user_chapter" ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "course_user_chapter_course_id_index" ON "users"."course_user_chapter" ("course_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."course_user_chapter" ADD CONSTRAINT "course_user_chapter_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

INSERT INTO users.course_user_chapter(uid,course_id,part,chapter,completed_at) 
SELECT uid, course_id, part, chapter, completed_at
FROM users.course_completed_chapters; --> statement-breakpoint
DROP TABLE "users"."course_completed_chapters";--> statement-breakpoint