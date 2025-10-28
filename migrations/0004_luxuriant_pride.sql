DO $$ BEGIN
 CREATE TYPE "public"."task_difficulty" AS ENUM('easy', 'medium', 'hard');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "difficulty" "task_difficulty" DEFAULT 'medium' NOT NULL;