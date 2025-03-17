UPDATE "content"."events" SET professor = NULL;

ALTER TABLE "content"."events" ALTER COLUMN "professor" SET DATA TYPE uuid USING "professor"::uuid;
