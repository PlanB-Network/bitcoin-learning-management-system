CREATE TYPE "public"."video_provider" AS ENUM('peertube', 'rumble', 'youtube');--> statement-breakpoint
CREATE TABLE "content"."videos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"course_id" varchar(100),
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content"."videos_localized" (
	"id" uuid NOT NULL,
	"language" varchar(10) NOT NULL,
	"provider" "video_provider" NOT NULL,
	"id_from_provider" varchar(40),
	CONSTRAINT "videos_localized_id_language_pk" PRIMARY KEY("id","language")
);
--> statement-breakpoint
ALTER TABLE "content"."videos" ADD CONSTRAINT "videos_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."videos_localized" ADD CONSTRAINT "videos_localized_id_videos_id_fk" FOREIGN KEY ("id") REFERENCES "content"."videos"("id") ON DELETE cascade ON UPDATE no action;