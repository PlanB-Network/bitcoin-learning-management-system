ALTER TABLE "content"."professors" DROP CONSTRAINT "professors_contributorId_unique";--> statement-breakpoint
ALTER TABLE "content"."professors" DROP CONSTRAINT "professors_contributor_id_contributors_id_fk";
--> statement-breakpoint
ALTER TABLE "content"."professors" DROP COLUMN "contributor_id";