CREATE TABLE IF NOT EXISTS "content"."tutorial_likes_dislikes" (
	"tutorial_id" integer NOT NULL,
	"uid" uuid NOT NULL,
	"liked" boolean NOT NULL,
	CONSTRAINT "tutorial_likes_dislikes_tutorial_id_uid_pk" PRIMARY KEY("tutorial_id","uid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_likes_dislikes" ADD CONSTRAINT "tutorial_likes_dislikes_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_likes_dislikes" ADD CONSTRAINT "tutorial_likes_dislikes_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
