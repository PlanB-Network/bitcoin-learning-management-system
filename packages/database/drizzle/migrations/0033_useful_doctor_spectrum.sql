CREATE TABLE IF NOT EXISTS "users"."exam_timestamps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_attempt_id" uuid NOT NULL,
	"txt" text NOT NULL,
	"sig" text NOT NULL,
	"ots" "bytea" NOT NULL,
	"hash" varchar(64) NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"block_hash" varchar(64),
	"block_height" integer,
	"block_timestamp" bigint,
	"pdf_key" varchar(255),
	"img_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."exam_timestamps" ADD CONSTRAINT "exam_timestamps_exam_attempt_id_exam_attempts_id_fk" FOREIGN KEY ("exam_attempt_id") REFERENCES "users"."exam_attempts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION users.auto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';
--> statement-breakpoint
CREATE OR REPLACE TRIGGER exam_timestamps_auto_updated_at BEFORE UPDATE ON "users"."exam_timestamps" FOR EACH ROW EXECUTE FUNCTION users.auto_updated_at();
