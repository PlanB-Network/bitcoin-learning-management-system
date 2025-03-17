ALTER TABLE "content"."tutorial_credits" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "content"."tutorial_credits" CASCADE;--> statement-breakpoint
DELETE FROM "content"."course_professors";
DELETE FROM "content"."course_chapters_localized_professors";
ALTER TABLE "content"."course_professors" ADD COLUMN "professor_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" ADD COLUMN "professor_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" DROP CONSTRAINT "course_chapters_localized_professors_contributor_id_contributors_id_fk";--> statement-breakpoint
ALTER TABLE "content"."course_professors" DROP CONSTRAINT "course_professors_contributor_id_contributors_id_fk";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" DROP CONSTRAINT "course_chapters_localized_professors_contributor_id_course_id_chapter_id_language_pk";--> statement-breakpoint
ALTER TABLE "content"."course_professors" DROP CONSTRAINT "course_professors_course_id_contributor_id_pk";--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_professor_id_course_id_chapter_id_language_pk" PRIMARY KEY("professor_id","course_id","chapter_id","language");--> statement-breakpoint
ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_course_id_professor_id_pk" PRIMARY KEY("course_id","professor_id");--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD COLUMN "professor_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD COLUMN "credit_link" text;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" ADD CONSTRAINT "course_chapters_localized_professors_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."course_professors" ADD CONSTRAINT "course_professors_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD CONSTRAINT "tutorials_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."course_chapters_localized_professors" DROP COLUMN "contributor_id";--> statement-breakpoint
ALTER TABLE "content"."course_professors" DROP COLUMN "contributor_id";
