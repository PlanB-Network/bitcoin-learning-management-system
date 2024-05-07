CREATE TABLE IF NOT EXISTS "users"."user_event" (
	"uid" uuid NOT NULL,
	"event_id" varchar(100) NOT NULL,
	"booked" boolean DEFAULT false,
	"with_physical" boolean DEFAULT false,
	CONSTRAINT "user_event_uid_event_id_pk" PRIMARY KEY("uid","event_id")
);
--> statement-breakpoint
ALTER TABLE "content"."events" ADD COLUMN "remaining_seats" integer;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_event_uid_index" ON "users"."user_event" ("uid");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_event_event_id_index" ON "users"."user_event" ("event_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."user_event" ADD CONSTRAINT "user_event_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."user_event" ADD CONSTRAINT "user_event_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
