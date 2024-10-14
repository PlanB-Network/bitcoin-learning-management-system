ALTER TABLE "content"."event_languages" DROP CONSTRAINT "event_languages_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."event_tags" DROP CONSTRAINT "event_tags_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."event_payment" DROP CONSTRAINT "event_payment_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."user_event" DROP CONSTRAINT "user_event_event_id_events_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."event_languages" ADD CONSTRAINT "event_languages_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."event_tags" ADD CONSTRAINT "event_tags_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."event_payment" ADD CONSTRAINT "event_payment_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."user_event" ADD CONSTRAINT "user_event_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
