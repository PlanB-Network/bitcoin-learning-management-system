ALTER TABLE "users"."accounts" ADD COLUMN "professor_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_professor_id_unique" UNIQUE("professor_id");