-- Custom SQL migration file, put your code below! --
ALTER TABLE "tasks" ADD COLUMN "assignee_id" text;
ALTER TABLE "tasks" ADD COLUMN "created_by_id" text;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_user_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;