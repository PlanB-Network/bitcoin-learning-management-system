ALTER TABLE "content"."professors" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "content"."resources" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "content"."tags" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "content"."tutorials" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
-- ALTER TABLE "content"."professors" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "content"."professors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
-- ALTER TABLE "content"."resources" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "content"."resources_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
-- ALTER TABLE "content"."tags" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "content"."tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
-- ALTER TABLE "content"."tutorials" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "content"."tutorials_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);
