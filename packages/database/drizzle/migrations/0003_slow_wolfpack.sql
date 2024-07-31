DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('student', 'professor', 'community', 'admin', 'superadmin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD COLUMN "role" "user_role" DEFAULT 'student' NOT NULL;