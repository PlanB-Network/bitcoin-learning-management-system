ALTER TABLE "content"."tutorial_likes_dislikes" DROP CONSTRAINT "tutorial_likes_dislikes_tutorial_id_old_uid_pk";--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" DROP CONSTRAINT "tutorial_tags_tutorial_id_old_tag_id_pk";--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" DROP CONSTRAINT "tutorials_localized_tutorial_id_old_language_pk";--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" ADD CONSTRAINT "tutorial_likes_dislikes_tutorial_id_uid_pk" PRIMARY KEY("tutorial_id","uid");--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tutorial_id_tag_id_pk" PRIMARY KEY("tutorial_id","tag_id");--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" ADD CONSTRAINT "tutorials_localized_tutorial_id_language_pk" PRIMARY KEY("tutorial_id","language");--> statement-breakpoint
ALTER TABLE "content"."proofreading" DROP COLUMN IF EXISTS "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorial_credits" DROP COLUMN IF EXISTS "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" DROP COLUMN IF EXISTS "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" DROP COLUMN IF EXISTS "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" DROP COLUMN IF EXISTS "tutorial_id_old";