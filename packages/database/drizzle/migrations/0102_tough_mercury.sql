ALTER TYPE "public"."notification_type" ADD VALUE 'blog' BEFORE 'calendar';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'calendar_48h_online_event' BEFORE 'celebration';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'calendar_24h_in_person_event' BEFORE 'celebration';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'calendar_5m_online_event' BEFORE 'celebration';--> statement-breakpoint
ALTER TABLE "content"."blogs" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."notifications" ADD COLUMN "blog_id" uuid;--> statement-breakpoint
ALTER TABLE "users"."notifications" ADD CONSTRAINT "notifications_blog_id_blogs_id_fk" FOREIGN KEY ("blog_id") REFERENCES "content"."blogs"("id") ON DELETE set null ON UPDATE no action;