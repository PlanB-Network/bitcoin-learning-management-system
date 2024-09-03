ALTER TABLE "content"."proofreading" RENAME COLUMN "tutorial_id" TO "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorial_credits" RENAME COLUMN "tutorial_id" TO "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" RENAME COLUMN "tutorial_id" TO "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" RENAME COLUMN "tutorial_id" TO "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" RENAME COLUMN "tutorial_id" TO "tutorial_id_old";--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" DROP CONSTRAINT "tutorial_likes_dislikes_tutorial_id_uid_pk";--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" DROP CONSTRAINT "tutorial_tags_tutorial_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" DROP CONSTRAINT "tutorials_localized_tutorial_id_language_pk";--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" ADD CONSTRAINT "tutorial_likes_dislikes_tutorial_id_old_uid_pk" PRIMARY KEY("tutorial_id_old","uid");--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" ADD CONSTRAINT "tutorial_tags_tutorial_id_old_tag_id_pk" PRIMARY KEY("tutorial_id_old","tag_id");--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" ADD CONSTRAINT "tutorials_localized_tutorial_id_old_language_pk" PRIMARY KEY("tutorial_id_old","language");