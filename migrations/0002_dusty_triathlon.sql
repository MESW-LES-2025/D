DO $$ BEGIN
 CREATE TYPE "public"."task_priority" AS ENUM('low', 'normal', 'high', 'urgent');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."task_status" AS ENUM('todo', 'in_progress', 'done', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" text,
	"user_id" text,
	"name" text NOT NULL,
	"description" text,
	"priority" "task_priority" DEFAULT 'normal' NOT NULL,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'user'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_user_id_user_id_fk'
      AND table_name = 'tasks'
  ) THEN
    ALTER TABLE "tasks"
      ADD CONSTRAINT "tasks_user_id_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "user"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  ELSE
    RAISE NOTICE 'Skipping FK: "user" table does not exist yet';
  END IF;
END $$;
