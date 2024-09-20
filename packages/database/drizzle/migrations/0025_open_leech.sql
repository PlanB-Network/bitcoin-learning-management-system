CREATE TABLE IF NOT EXISTS "content"."builders_locations" (
	"place_id" integer NOT NULL,
	"name" text PRIMARY KEY NOT NULL,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL
);
