ALTER TABLE "content"."events" ALTER COLUMN "path" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."events" ADD CONSTRAINT "events_path_unique" UNIQUE("path");