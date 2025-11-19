DO $$ BEGIN
 CREATE TYPE "public"."translation_job_status" AS ENUM('pending', 'starting', 'processing', 'polling', 'converting', 'completed', 'failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."translation_job_type" AS ENUM('upload', 'translation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "content"."translation_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"type" "translation_job_type" NOT NULL,
	"status" "translation_job_status" DEFAULT 'pending' NOT NULL,
	"languages" varchar(10)[],
	"progress" text,
	"error" text,
	"task_id" text,
	"upload_id" uuid,
	"total_files" integer,
	"processed_files" integer,
	"current_file" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"last_update" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "translation_jobs_courseId_type_unique" UNIQUE("course_id","type")
);
--> statement-breakpoint
ALTER TABLE "content"."course_translation_uploads" ADD COLUMN IF NOT EXISTS "pptx_file_hash" text;--> statement-breakpoint
ALTER TABLE "content"."course_translation_uploads" ADD COLUMN IF NOT EXISTS "text_file_hash" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."translation_jobs" ADD CONSTRAINT "translation_jobs_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;