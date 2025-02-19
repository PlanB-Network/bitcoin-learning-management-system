ALTER TABLE "content"."professors" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "content"."professors" ALTER COLUMN "id" SET DATA TYPE uuid USING "id"::uuid;
ALTER TABLE "content"."professor_tags" ALTER COLUMN "professor_id" SET DATA TYPE uuid USING "professor_id"::uuid;
ALTER TABLE "content"."professors_localized" ALTER COLUMN "professor_id" SET DATA TYPE uuid USING "professor_id"::uuid;
ALTER TABLE "users"."accounts" ALTER COLUMN "professor_id" SET DATA TYPE uuid USING "professor_id"::uuid;
ALTER TABLE "content"."professor_tags" ADD CONSTRAINT "professor_tags_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "content"."professors_localized" ADD CONSTRAINT "professors_localized_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."accounts" ADD CONSTRAINT "accounts_professor_id_professors_id_fk" FOREIGN KEY ("professor_id") REFERENCES "content"."professors"("id") ON DELETE no action ON UPDATE cascade;
