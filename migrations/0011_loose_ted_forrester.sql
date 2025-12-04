ALTER TYPE "public"."task_status" ADD VALUE 'deleted';--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;