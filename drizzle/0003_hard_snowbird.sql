CREATE TABLE "voter_passkey_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"voter_id" integer,
	"credential_id" varchar(255) NOT NULL,
	"public_key" varchar(1024) NOT NULL,
	"counter" integer DEFAULT 0 NOT NULL,
	"transports" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voters" (
	"id" serial PRIMARY KEY NOT NULL,
	"voter_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"designation" varchar(255) NOT NULL,
	"unit_name" varchar(255) NOT NULL,
	"mobile_no" varchar(20) NOT NULL,
	"passkey" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "voters_voter_id_unique" UNIQUE("voter_id")
);
--> statement-breakpoint
ALTER TABLE "voter_passkey_credentials" ADD CONSTRAINT "voter_passkey_credentials_voter_id_voters_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."voters"("id") ON DELETE no action ON UPDATE no action;