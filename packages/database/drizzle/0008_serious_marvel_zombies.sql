ALTER TYPE "event_type" ADD VALUE 'workshop';--> statement-breakpoint
ALTER TYPE "event_type" ADD VALUE 'course';--> statement-breakpoint
ALTER TABLE "users"."event_payment" DROP CONSTRAINT "event_payment_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."event_languages" ALTER COLUMN "event_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."event_tags" ALTER COLUMN "event_id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "path" varchar(255) NOT NULL DEFAULT '#';--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."event_payment" ADD CONSTRAINT "event_payment_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "content"."events" ADD CONSTRAINT "events_path_unique" UNIQUE("path");