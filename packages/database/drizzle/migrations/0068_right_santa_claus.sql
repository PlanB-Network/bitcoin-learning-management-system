ALTER TABLE "users"."course_payment" DROP CONSTRAINT "course_payment_course_id_courses_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."event_payment" DROP CONSTRAINT "event_payment_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."course_payment" ADD CONSTRAINT "course_payment_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "content"."courses"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "users"."event_payment" ADD CONSTRAINT "event_payment_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "content"."events"("id") ON DELETE no action ON UPDATE cascade;