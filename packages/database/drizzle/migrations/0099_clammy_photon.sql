CREATE TYPE "public"."notification_type" AS ENUM('assignment', 'calendar', 'celebration', 'general', 'warning');--> statement-breakpoint
CREATE TABLE "users"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"chapter_id" uuid,
	"event_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."scheduled_course_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notification_id" uuid NOT NULL,
	"professor_id" uuid NOT NULL,
	"course_id" varchar(100) NOT NULL,
	"student_group" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"timezone" varchar(50) NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."user_notification_status" (
	"uid" uuid NOT NULL,
	"notification_id" uuid NOT NULL,
	"read_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_notification_status_uid_notification_id_pk" PRIMARY KEY("uid","notification_id")
);
--> statement-breakpoint
ALTER TABLE "users"."course_review" RENAME COLUMN "recommand" TO "recommend";--> statement-breakpoint
ALTER TABLE "users"."notifications" ADD CONSTRAINT "notifications_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."notifications" ADD CONSTRAINT "notifications_chapter_id_course_chapters_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "content"."course_chapters"("chapter_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."notifications" ADD CONSTRAINT "notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."scheduled_course_notifications" ADD CONSTRAINT "scheduled_course_notifications_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "users"."notifications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."scheduled_course_notifications" ADD CONSTRAINT "scheduled_course_notifications_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."scheduled_course_notifications" ADD CONSTRAINT "scheduled_course_notifications_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."user_notification_status" ADD CONSTRAINT "user_notification_status_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."user_notification_status" ADD CONSTRAINT "user_notification_status_notification_id_notifications_id_fk" FOREIGN KEY ("notification_id") REFERENCES "users"."notifications"("id") ON DELETE cascade ON UPDATE no action;