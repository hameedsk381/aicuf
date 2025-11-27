ALTER TABLE "votes" ALTER COLUMN "choice" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "position" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "votes" ADD COLUMN "nomination_id" integer;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_nomination_id_nominations_id_fk" FOREIGN KEY ("nomination_id") REFERENCES "public"."nominations"("id") ON DELETE no action ON UPDATE no action;