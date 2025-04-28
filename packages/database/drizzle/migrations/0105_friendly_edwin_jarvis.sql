CREATE TABLE "users"."account_settings" (
	"uid" uuid PRIMARY KEY NOT NULL,
	"platform_notify_events" boolean DEFAULT true NOT NULL,
	"platform_notify_courses" boolean DEFAULT true NOT NULL,
	"platform_notify_general" boolean DEFAULT true NOT NULL,
	"email_notify_courses" boolean DEFAULT true NOT NULL,
	"email_notify_general" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users"."account_settings" ADD CONSTRAINT "account_settings_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE cascade;

INSERT INTO users.account_settings (
    uid,
    platform_notify_events,
    platform_notify_courses,
    platform_notify_general,
    email_notify_courses,
    email_notify_general,
    created_at,
    updated_at
)
SELECT
    a.uid,
    true,
    true,
    true,
    true,
    true,
    now(),
    now()
FROM
    users.accounts a
WHERE NOT EXISTS (
    SELECT 1
    FROM users.account_settings s
    WHERE s.uid = a.uid
);
