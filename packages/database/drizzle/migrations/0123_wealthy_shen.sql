ALTER TABLE "users"."exam_timestamps" ALTER COLUMN "exam_attempt_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users"."exam_timestamps" ADD COLUMN "uid" uuid;--> statement-breakpoint
ALTER TABLE "users"."exam_timestamps" ADD COLUMN "course_id" varchar(100);--> statement-breakpoint
ALTER TABLE "users"."exam_timestamps" ADD CONSTRAINT "exam_timestamps_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."exam_timestamps" ADD CONSTRAINT "exam_timestamps_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE cascade ON UPDATE no action;