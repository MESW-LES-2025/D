CREATE TABLE "goal_tasks" (
	"goal_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	CONSTRAINT "goal_tasks_goal_id_task_id_pk" PRIMARY KEY("goal_id","task_id")
);
