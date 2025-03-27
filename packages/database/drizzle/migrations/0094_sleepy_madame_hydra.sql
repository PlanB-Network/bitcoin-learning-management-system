ALTER TABLE "content"."courses" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."newsletters" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."youtube_channels" ADD COLUMN "project_id" uuid;--> statement-breakpoint
ALTER TABLE "content"."courses" ADD CONSTRAINT "courses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."newsletters" ADD CONSTRAINT "newsletters_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."youtube_channels" ADD CONSTRAINT "youtube_channels_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;