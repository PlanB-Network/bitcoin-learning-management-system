ALTER TABLE "content"."proofreading" DROP CONSTRAINT "proofreading_tutorial_id_tutorials_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."tutorial_credits" DROP CONSTRAINT "tutorial_credits_tutorial_id_tutorials_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" DROP CONSTRAINT "tutorial_likes_dislikes_tutorial_id_tutorials_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" DROP CONSTRAINT "tutorial_tags_tutorial_id_tutorials_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" DROP CONSTRAINT "tutorials_localized_tutorial_id_tutorials_id_fk";
