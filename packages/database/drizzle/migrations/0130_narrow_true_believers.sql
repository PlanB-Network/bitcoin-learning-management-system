CREATE TABLE "content"."course_translation_uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"original_language" varchar(10) NOT NULL,
	"translation_languages" varchar(10)[] NOT NULL,
	"uploader_id" uuid NOT NULL,
	"part_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"pptx_file_url" text,
	"text_file_url" text,
	"upload_success" boolean DEFAULT false NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content"."course_translation_uploads" ADD CONSTRAINT "course_translation_uploads_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."course_translation_uploads" ADD CONSTRAINT "course_translation_uploads_uploader_id_accounts_uid_fk" FOREIGN KEY ("uploader_id") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."course_translation_uploads" ADD CONSTRAINT "course_translation_uploads_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."course_translation_uploads" ADD CONSTRAINT "course_translation_uploads_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
