CREATE TYPE "public"."task_label_color" AS ENUM('gray', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'purple');--> statement-breakpoint
CREATE TYPE "public"."task_log_action" AS ENUM('created', 'updated', 'deleted', 'status_changed', 'priority_changed', 'difficulty_changed', 'assigned', 'unassigned', 'label_added', 'label_removed', 'comment_added');--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'backlog' BEFORE 'todo';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'review' BEFORE 'done';--> statement-breakpoint
ALTER TYPE "public"."task_status" ADD VALUE 'canceled';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'medium'::text;--> statement-breakpoint
DROP TYPE "public"."task_priority";--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DEFAULT 'medium'::"public"."task_priority";--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "priority" SET DATA TYPE "public"."task_priority" USING "priority"::"public"."task_priority";--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_organization_id_organization_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;