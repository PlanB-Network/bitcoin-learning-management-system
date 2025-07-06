CREATE TABLE "content"."course_translation_slides" (
	"course_id" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"part_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"slide_id" uuid NOT NULL,
	"slide_number" integer NOT NULL,
	"ppt_validated" boolean DEFAULT false NOT NULL,
	"transcription_validated" boolean DEFAULT false NOT NULL,
	"audio_validated" boolean DEFAULT false NOT NULL,
	"ppt_resource_path" text,
	"audio_resource_path" text,
	"original_content" text,
	"translated_content" text,
	"status" "translation_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_translation_slides_course_id_language_part_id_chapter_id_slide_id_pk" PRIMARY KEY("course_id","language","part_id","chapter_id","slide_id")
);
--> statement-breakpoint
ALTER TABLE "content"."course_translation_slides" ADD CONSTRAINT "course_translation_slides_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."course_translation_slides" ADD CONSTRAINT "course_translation_slides_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."course_translation_slides" ADD CONSTRAINT "course_translation_slides_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."course_translation_slides" ADD CONSTRAINT "course_translation_slides_to_translation_chapters_fk" FOREIGN KEY ("course_id","language","part_id","chapter_id") REFERENCES "content"."course_translation_chapters"("course_id","language","part_id","chapter_id") ON DELETE cascade ON UPDATE no action;