CREATE TABLE IF NOT EXISTS "content"."b_certificate_exam" (
	"id" uuid PRIMARY KEY NOT NULL,
	"path" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"location" text NOT NULL,
	"min_score" integer NOT NULL,
	"duration" integer NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "b_certificate_exam_path_unique" UNIQUE("path")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users"."b_certificate_results" (
	"uid" uuid NOT NULL,
	"b_certificate_exam" uuid NOT NULL,
	"category" varchar NOT NULL,
	"score" integer NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"last_commit" varchar(40) NOT NULL,
	"last_sync" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "b_certificate_results_uid_b_certificate_exam_category_pk" PRIMARY KEY("uid","b_certificate_exam","category")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."b_certificate_results" ADD CONSTRAINT "b_certificate_results_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."b_certificate_results" ADD CONSTRAINT "b_certificate_results_b_certificate_exam_b_certificate_exam_id_fk" FOREIGN KEY ("b_certificate_exam") REFERENCES "content"."b_certificate_exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
