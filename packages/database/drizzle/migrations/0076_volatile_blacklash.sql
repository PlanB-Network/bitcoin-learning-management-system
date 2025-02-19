ALTER TABLE "content"."professor_tags" DROP CONSTRAINT "professor_tags_professor_id_professors_id_fk";
ALTER TABLE "content"."professors_localized" DROP CONSTRAINT "professors_localized_professor_id_professors_id_fk";
ALTER TABLE "users"."accounts" DROP CONSTRAINT "accounts_professor_id_professors_id_fk";
ALTER TABLE "content"."professor_tags" ALTER COLUMN "professor_id" SET DATA TYPE varchar;
ALTER TABLE "content"."professors" ALTER COLUMN "id" SET DATA TYPE varchar;
-- ALTER TABLE "content"."professors" ALTER COLUMN "id" DROP IDENTITY;
ALTER TABLE "content"."professors_localized" ALTER COLUMN "professor_id" SET DATA TYPE varchar;
ALTER TABLE "users"."accounts" ALTER COLUMN "professor_id" SET DATA TYPE varchar;
