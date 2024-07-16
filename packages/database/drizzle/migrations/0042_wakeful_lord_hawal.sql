ALTER TABLE "content"."courses" ALTER COLUMN "topic" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "content"."courses" ALTER COLUMN "topic" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."courses" ALTER COLUMN "subtopic" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "content"."courses" ALTER COLUMN "subtopic" SET NOT NULL;