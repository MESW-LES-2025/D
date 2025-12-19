ALTER TYPE "public"."point_transaction_type" ADD VALUE 'reward_redemption';--> statement-breakpoint
ALTER TABLE "reward_redemptions" ALTER COLUMN "status" SET DEFAULT 'toClaim';--> statement-breakpoint
ALTER TABLE "reward_redemptions" ALTER COLUMN "status" SET NOT NULL;