CREATE TABLE "reward_redemptions" (
	"reward_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"redeemed_at" timestamp DEFAULT now() NOT NULL,
	"points_spent" integer NOT NULL,
	"status" text DEFAULT 'pending',
	CONSTRAINT "reward_redemptions_reward_id_user_id_pk" PRIMARY KEY("reward_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "rewards" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rewards" ADD COLUMN "picture" text;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reward_redemptions" ADD CONSTRAINT "reward_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;