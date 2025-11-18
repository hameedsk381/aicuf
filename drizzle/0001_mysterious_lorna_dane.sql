ALTER TABLE "registrations" ADD COLUMN "password" varchar(255);--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "role" varchar(20) DEFAULT 'member' NOT NULL;