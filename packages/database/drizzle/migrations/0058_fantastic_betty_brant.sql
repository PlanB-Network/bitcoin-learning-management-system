ALTER TABLE "content"."builders_locations" RENAME TO "projects_locations";--> statement-breakpoint
ALTER TABLE "content"."builders" RENAME TO "projects";--> statement-breakpoint
ALTER TABLE "content"."builders_localized" RENAME TO "projects_localized";--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "content"."projects" DROP CONSTRAINT "builders_resource_id_resources_id_fk";
ALTER TABLE "content"."projects_localized" DROP CONSTRAINT "builders_localized_id_builders_id_fk";--> statement-breakpoint

ALTER TABLE "content"."bet" DROP CONSTRAINT "bet_project_id_builders_id_fk";--> statement-breakpoint
ALTER TABLE "content"."conferences" DROP CONSTRAINT "conferences_project_id_builders_id_fk";--> statement-breakpoint
ALTER TABLE "content"."events" DROP CONSTRAINT "events_project_id_builders_id_fk";--> statement-breakpoint
ALTER TABLE "content"."tutorials" DROP CONSTRAINT "tutorials_project_id_builders_id_fk";--> statement-breakpoint
ALTER TABLE "content"."projects_localized" DROP CONSTRAINT "builders_localized_id_language_pk";--> statement-breakpoint
ALTER TABLE "content"."projects" DROP CONSTRAINT "builders_id_unique";--> statement-breakpoint

ALTER TABLE "content"."projects" ADD CONSTRAINT "projects_id_unique" UNIQUE("id");
ALTER TABLE "content"."projects" ADD CONSTRAINT "projects_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "content"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."projects_localized" ADD CONSTRAINT "projects_localized_id_language_pk" PRIMARY KEY("id","language");--> statement-breakpoint
ALTER TABLE "content"."projects_localized" ADD CONSTRAINT "projects_localized_id_projects_id_fk" FOREIGN KEY ("id") REFERENCES "content"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."bet" ADD CONSTRAINT "bet_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."conferences" ADD CONSTRAINT "conferences_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."events" ADD CONSTRAINT "events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content"."tutorials" ADD CONSTRAINT "tutorials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "content"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
