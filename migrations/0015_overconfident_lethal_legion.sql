CREATE TYPE "public"."achievement_id" AS ENUM('first_steps', 'task_master', 'speed_demon', 'consistency_king', 'century_club', 'perfectionist', 'on_fire', 'elite_achiever', 'legendary');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('deadline_update', 'goal');--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"achievement_id" "achievement_id" NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goal_assignees" (
	"goal_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "goal_assignees_goal_id_user_id_pk" PRIMARY KEY("goal_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_assignees" ADD CONSTRAINT "goal_assignees_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_assignees" ADD CONSTRAINT "goal_assignees_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;