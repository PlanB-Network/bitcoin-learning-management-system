ALTER TABLE "content"."course_chapters" ADD COLUMN "chapter_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."course_chapters" ADD COLUMN "last_sync" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "last_sync" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_parts" ADD COLUMN "part_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."course_parts" ADD COLUMN "last_sync" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_parts_localized" ADD COLUMN "last_sync" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_chapter_id_unique" UNIQUE("chapter_id");--> statement-breakpoint
ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_part_id_unique" UNIQUE("part_id");