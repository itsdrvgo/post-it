CREATE TABLE IF NOT EXISTS "post_it__posts" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"metadata" json DEFAULT 'null'::json,
	"attachments" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"author_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_it__sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_it__users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_first_time" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_it__users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "author_id_idx" ON "post_it__posts" ("author_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "created_at_idx" ON "post_it__posts" ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "username_idx" ON "post_it__users" ("username");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_it__sessions" ADD CONSTRAINT "post_it__sessions_user_id_post_it__users_id_fk" FOREIGN KEY ("user_id") REFERENCES "post_it__users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
