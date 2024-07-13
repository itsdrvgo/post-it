ALTER TABLE "post_it__users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;--> statement-breakpoint
ALTER TABLE "post_it__users" ADD COLUMN "is_restricted" boolean DEFAULT false NOT NULL;