CREATE TABLE "votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"voter_id" integer,
	"choice" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voters" ADD COLUMN "status" varchar(20) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_id_voters_id_fk" FOREIGN KEY ("voter_id") REFERENCES "public"."voters"("id") ON DELETE no action ON UPDATE no action;