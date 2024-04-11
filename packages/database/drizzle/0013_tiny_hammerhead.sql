ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "is_online" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "is_in_person" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "timezone" text;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "address_line_1" text;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "address_line_2" text;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "address_line_3" text;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "live_url" text;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized" ADD COLUMN "available_seats" integer;