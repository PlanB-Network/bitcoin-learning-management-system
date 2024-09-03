ALTER TABLE "content"."tutorial_credits" ALTER COLUMN "tutorial_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" ALTER COLUMN "tutorial_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" ALTER COLUMN "tutorial_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" ALTER COLUMN "tutorial_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."proofreading" ADD CONSTRAINT "proofreading_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_credits" ADD CONSTRAINT "tutorial_credits_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_likes_dislikes" ADD CONSTRAINT "tutorial_likes_dislikes_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "content"."tutorials_localized" ADD CONSTRAINT "tutorials_localized_tutorial_id_tutorials_id_fk" FOREIGN KEY ("tutorial_id") REFERENCES "content"."tutorials"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
