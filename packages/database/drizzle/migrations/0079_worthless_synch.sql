CREATE TABLE "content"."labs_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lab_id" uuid NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"live_url" varchar(255),
	"raw_content" text NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content"."labs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"path" varchar(255) NOT NULL,
	"study_group" varchar(20),
	"professor_id" uuid NOT NULL,
	"student_count" integer DEFAULT 0 NOT NULL,
	"telegram_url" varchar(100),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "labs_path_unique" UNIQUE("path")
);
--> statement-breakpoint
ALTER TABLE "content"."labs_sessions" ADD CONSTRAINT "labs_sessions_lab_id_labs_id_fk" FOREIGN KEY ("lab_id") REFERENCES "content"."labs"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."labs" ADD CONSTRAINT "labs_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE no action ON UPDATE cascade;