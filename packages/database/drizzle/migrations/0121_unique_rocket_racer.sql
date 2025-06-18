CREATE TYPE "public"."payment_item" AS ENUM('summer_school_2025');--> statement-breakpoint
CREATE TABLE "users"."general_payment" (
	"uid" uuid NOT NULL,
	"item" "payment_item" NOT NULL,
	"payment_id" varchar(255) NOT NULL,
	"format" "course_payment_format" DEFAULT 'inperson' NOT NULL,
	"payment_status" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"invoice_url" varchar(255),
	"stripe_invoice_id" varchar(255),
	"stripe_payment_intent" varchar(255),
	"method" "course_payment_method" NOT NULL,
	"coupon_code" varchar(20),
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "general_payment_uid_item_payment_id_pk" PRIMARY KEY("uid","item","payment_id")
);
--> statement-breakpoint
ALTER TABLE "users"."general_payment" ADD CONSTRAINT "general_payment_uid_accounts_uid_fk" FOREIGN KEY ("uid") REFERENCES "users"."accounts"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."general_payment" ADD CONSTRAINT "general_payment_coupon_code_coupon_code_code_fk" FOREIGN KEY ("coupon_code") REFERENCES "content"."coupon_code"("code") ON DELETE no action ON UPDATE no action;