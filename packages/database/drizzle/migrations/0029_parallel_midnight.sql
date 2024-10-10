ALTER TABLE "content"."course_chapters" ADD CONSTRAINT "course_chapters_chapterId_unique" UNIQUE("chapter_id");--> statement-breakpoint
ALTER TABLE "content"."course_parts" ADD CONSTRAINT "course_parts_partId_unique" UNIQUE("part_id");--> statement-breakpoint
ALTER TABLE "content"."professors" ADD CONSTRAINT "professors_contributorId_unique" UNIQUE("contributor_id");--> statement-breakpoint
ALTER TABLE "content"."proofreading_contributor" ADD CONSTRAINT "proofreading_contributor_proofreadingId_unique" UNIQUE("proofreading_id");--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_contributorId_unique" UNIQUE("contributor_id");--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_professorId_unique" UNIQUE("professor_id");--> statement-breakpoint
ALTER TABLE "users"."lud4_public_keys" ADD CONSTRAINT "lud4_public_keys_publicKey_unique" UNIQUE("public_key");
