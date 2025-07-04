ALTER TABLE "users"."accounts" ADD COLUMN "university" varchar(100);--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_university_unique" UNIQUE("university");