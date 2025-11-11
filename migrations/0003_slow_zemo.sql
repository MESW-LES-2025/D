-- Custom SQL migration file, put your code below! --
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "assignee_id" text;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "created_by_id" text;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'user'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_assignee_id_user_id_fk'
      AND table_name = 'tasks'
  ) THEN
    ALTER TABLE "tasks"
      ADD CONSTRAINT "tasks_assignee_id_user_id_fk"
      FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id")
      ON DELETE set null ON UPDATE no action;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'user'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_created_by_id_user_id_fk'
      AND table_name = 'tasks'
  ) THEN
    ALTER TABLE "tasks"
      ADD CONSTRAINT "tasks_created_by_id_user_id_fk"
      FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id")
      ON DELETE set null ON UPDATE no action;
  END IF;
END $$;