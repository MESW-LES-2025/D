DROP TABLE IF EXISTS "counter" CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;