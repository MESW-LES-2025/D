import { integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizationTable } from '@/schema/organization';
import { userTable } from '@/schema/user';

export const rewardTable = pgTable('rewards', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  points: integer('points').notNull().default(0),
  picture: text('picture'),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationTable.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Separate table for tracking who redeemed which reward
export const rewardRedemptionsTable = pgTable('reward_redemptions', {
  rewardId: uuid('reward_id')
    .notNull()
    .references(() => rewardTable.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizationTable.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  redeemedAt: timestamp('redeemed_at').defaultNow().notNull(),
  pointsSpent: integer('points_spent').notNull(),
  status: text('status').default('toClaim').notNull(), // 'toClaim', 'pending', 'completed', 'cancelled'
}, table => ({
  primaryKey: primaryKey({ columns: [table.rewardId, table.userId] }),
}));
