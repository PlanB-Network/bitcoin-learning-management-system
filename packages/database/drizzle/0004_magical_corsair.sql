CREATE TABLE IF NOT EXISTS "content"."events" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"start_date" timestamp with time zone,
	"duration" double precision NOT NULL,
	"price_dollars" integer,
	"title" text,
	"description" text,
	"address_line_1" text,
	"address_line_2" text,
	"address_line_3" text,
	"asset_url" text,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."event_payment" (
	"uid" uuid NOT NULL,
	"event_id" varchar(20) NOT NULL,
	"with_physical" boolean DEFAULT false,
	"payment_status" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"payment_id" varchar(255) NOT NULL,
	"invoice_url" varchar(255),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_payment_uid_event_id_payment_id_pk" PRIMARY KEY("uid","event_id","payment_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."event_payment" ADD CONSTRAINT "event_payment_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."event_payment" ADD CONSTRAINT "event_payment_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
