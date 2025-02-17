ALTER TABLE "content"."courses" ALTER COLUMN "id" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "content"."courses" ADD COLUMN "index" varchar(20);--> statement-breakpoint
ALTER TABLE "content"."courses" ADD CONSTRAINT "courses_index_unique" UNIQUE("index");
UPDATE "content"."courses" SET index = id;
