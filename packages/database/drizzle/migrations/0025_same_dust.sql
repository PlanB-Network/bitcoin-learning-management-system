ALTER TABLE "content"."bet" ADD COLUMN "builder_id" integer;--> statement-breakpoint
ALTER TABLE "content"."conferences" ADD COLUMN "builder_id" integer;--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "builder_id" integer;--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD COLUMN "builder_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."bet" ADD CONSTRAINT "bet_builder_id_builders_resource_id_fk" FOREIGN KEY ("builder_id") REFERENCES "content"."builders"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."conferences" ADD CONSTRAINT "conferences_builder_id_builders_resource_id_fk" FOREIGN KEY ("builder_id") REFERENCES "content"."builders"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."events" ADD CONSTRAINT "events_builder_id_builders_resource_id_fk" FOREIGN KEY ("builder_id") REFERENCES "content"."builders"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorials" ADD CONSTRAINT "tutorials_builder_id_builders_resource_id_fk" FOREIGN KEY ("builder_id") REFERENCES "content"."builders"("resource_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
