DROP TABLE IF EXISTS "task_labels" CASCADE;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DROP TYPE "public"."task_label_color";