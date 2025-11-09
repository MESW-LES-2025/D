CREATE TYPE "public"."roles" AS ENUM('administrator', 'member');--> statement-breakpoint
CREATE TYPE "public"."priorities" AS ENUM('low', 'normal', 'high', 'critial');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('to_do', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "groups_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role_id" "roles",
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(2048) NOT NULL,
	"path_photo" varchar(256),
	"score" integer NOT NULL,
	"due_date" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"user_id" text,
	"name" varchar(256) NOT NULL,
	"description" varchar(2048) NOT NULL,
	"priority" "priorities" NOT NULL,
	"status" "status" NOT NULL,
	"score" integer NOT NULL,
	"due_date" timestamp NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "groups_members" ADD CONSTRAINT "groups_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups_members" ADD CONSTRAINT "groups_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "groups_members_group_id_index" ON "groups_members" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "groups_members_user_id_index" ON "groups_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rewards_group_id_index" ON "rewards" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "tasks_group_id_index" ON "tasks" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "tasks_user_id_index" ON "tasks" USING btree ("user_id");