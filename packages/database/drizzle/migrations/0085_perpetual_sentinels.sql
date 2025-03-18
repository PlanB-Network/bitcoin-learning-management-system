ALTER TABLE "content"."professors" ALTER COLUMN "affiliations" SET DATA TYPE uuid[] using "affiliations"::uuid[];
