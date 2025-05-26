ALTER TABLE "content"."course_assignment" ADD COLUMN "mentor" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_assignment" ADD COLUMN "telegram_url" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_assignment" ADD COLUMN "last_updated" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_assignment" ADD COLUMN "last_commit" varchar(40) NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."course_assignment" ADD COLUMN "last_sync" timestamp with time zone DEFAULT now() NOT NULL;