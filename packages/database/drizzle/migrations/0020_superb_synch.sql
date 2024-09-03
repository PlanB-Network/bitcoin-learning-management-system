ALTER TABLE "content"."proofreading" ADD COLUMN "tutorial_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."tutorial_credits" ADD COLUMN "tutorial_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."tutorial_likes_dislikes" ADD COLUMN "tutorial_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."tutorial_tags" ADD COLUMN "tutorial_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."tutorials_localized" ADD COLUMN "tutorial_id" uuid;

UPDATE content.tutorial_tags tg SET tutorial_id = (SELECT id from content.tutorials WHERE id_old = tg.tutorial_id_old);
UPDATE content.tutorial_likes_dislikes tg SET tutorial_id = (SELECT id from content.tutorials WHERE id_old = tg.tutorial_id_old);
UPDATE content.tutorial_credits tg SET tutorial_id = (SELECT id from content.tutorials WHERE id_old = tg.tutorial_id_old);
UPDATE content.proofreading tg SET tutorial_id = (SELECT id from content.tutorials WHERE id_old = tg.tutorial_id_old);
UPDATE content.tutorials_localized tg SET tutorial_id = (SELECT id from content.tutorials WHERE id_old = tg.tutorial_id_old);
