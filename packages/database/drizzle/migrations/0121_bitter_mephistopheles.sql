CREATE TYPE "public"."assignment_status" AS ENUM('requested', 'assigned', 'in_progress', 'completed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."review_status" AS ENUM('approved', 'rejected', 'needs_changes');--> statement-breakpoint
CREATE TYPE "public"."translation_status" AS ENUM('todo', 'in_progress', 'ready_for_review', 'under_review', 'reviewed', 'published');--> statement-breakpoint
ALTER TYPE "public"."user_permission" ADD VALUE 'contribute:reviewer';--> statement-breakpoint
ALTER TYPE "public"."user_permission" ADD VALUE 'contribute:assign';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'contributor' BEFORE 'admin';--> statement-breakpoint
CREATE TABLE "content"."course_translation_chapters" (
	"course_id" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"part_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"status" "translation_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_translation_chapters_course_id_language_part_id_chapter_id_pk" PRIMARY KEY("course_id","language","part_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "content"."course_translations" (
	"course_id" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"status" "translation_status" DEFAULT 'todo' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "course_translations_course_id_language_pk" PRIMARY KEY("course_id","language")
);
--> statement-breakpoint
CREATE TABLE "users"."reviewer_languages" (
	"reviewer_id" uuid NOT NULL,
	"language_code" text NOT NULL,
	"proficiency_level" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "reviewer_languages_reviewer_id_language_code_pk" PRIMARY KEY("reviewer_id","language_code")
);
--> statement-breakpoint
CREATE TABLE "users"."translation_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"assignee_id" uuid NOT NULL,
	"assigner_id" uuid NOT NULL,
	"status" "assignment_status" DEFAULT 'requested' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"rejection_reason" text,
	CONSTRAINT "translation_assignments_courseId_language_assigneeId_unique" UNIQUE("course_id","language","assignee_id")
);
--> statement-breakpoint
CREATE TABLE "users"."translation_chapter_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"part_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"assignee_id" uuid NOT NULL,
	"assigner_id" uuid NOT NULL,
	"status" "assignment_status" DEFAULT 'requested' NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"rejection_reason" text,
	CONSTRAINT "translation_chapter_assignments_courseId_language_partId_chapterId_assigneeId_unique" UNIQUE("course_id","language","part_id","chapter_id","assignee_id")
);
--> statement-breakpoint
CREATE TABLE "users"."translation_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"status" "review_status" NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "translation_reviews_courseId_language_reviewerId_unique" UNIQUE("course_id","language","reviewer_id")
);
--> statement-breakpoint
ALTER TABLE "content"."course_translation_chapters" ADD CONSTRAINT "course_translation_chapters_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."course_translation_chapters" ADD CONSTRAINT "course_translation_chapters_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."course_translation_chapters" ADD CONSTRAINT "course_translation_chapters_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."course_translation_chapters" ADD CONSTRAINT "course_translation_chapters_to_translations_fk" FOREIGN KEY ("course_id","language") REFERENCES "content"."course_translations"("course_id","language") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."course_translations" ADD CONSTRAINT "course_translations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."reviewer_languages" ADD CONSTRAINT "reviewer_languages_reviewer_id_accounts_uid_fk" FOREIGN KEY ("reviewer_id") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."reviewer_languages" ADD CONSTRAINT "reviewer_languages_language_code_languages_code_fk" FOREIGN KEY ("language_code") REFERENCES "users"."languages"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_assignments" ADD CONSTRAINT "translation_assignments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."translation_assignments" ADD CONSTRAINT "translation_assignments_assignee_id_accounts_uid_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_assignments" ADD CONSTRAINT "translation_assignments_assigner_id_accounts_uid_fk" FOREIGN KEY ("assigner_id") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_assignments" ADD CONSTRAINT "translation_assignments_to_translations_fk" FOREIGN KEY ("course_id","language") REFERENCES "content"."course_translations"("course_id","language") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_chapter_assignments" ADD CONSTRAINT "translation_chapter_assignments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."translation_chapter_assignments" ADD CONSTRAINT "translation_chapter_assignments_part_id_course_parts_part_id_fk" FOREIGN KEY ("part_id") REFERENCES "content"."course_parts"("part_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_chapter_assignments" ADD CONSTRAINT "translation_chapter_assignments_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_chapter_assignments" ADD CONSTRAINT "translation_chapter_assignments_assignee_id_accounts_uid_fk" FOREIGN KEY ("assignee_id") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_chapter_assignments" ADD CONSTRAINT "translation_chapter_assignments_assigner_id_accounts_uid_fk" FOREIGN KEY ("assigner_id") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_chapter_assignments" ADD CONSTRAINT "translation_chapter_assignments_to_translation_chapters_fk" FOREIGN KEY ("course_id","language","part_id","chapter_id") REFERENCES "content"."course_translation_chapters"("course_id","language","part_id","chapter_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_reviews" ADD CONSTRAINT "translation_reviews_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."translation_reviews" ADD CONSTRAINT "translation_reviews_reviewer_id_accounts_uid_fk" FOREIGN KEY ("reviewer_id") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."translation_reviews" ADD CONSTRAINT "translation_reviews_to_translations_fk" FOREIGN KEY ("course_id","language") REFERENCES "content"."course_translations"("course_id","language") ON DELETE cascade ON UPDATE no action;