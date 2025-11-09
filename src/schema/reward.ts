import { relations } from 'drizzle-orm';
import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { groupTable } from './group';

// Table
export const rewardTable = pgTable('rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groupTable.id),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 2048 }).notNull(),
  pathPhoto: varchar('path_photo', { length: 256 }),
  score: integer('score').notNull(),
  dueDate: timestamp('due_date').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  removedAt: timestamp('removed_at'),
}, table => ({
  groupIdIdx: index('rewards_group_id_index').on(table.groupId),
}));

// Relations
export const rewardsRelations = relations(rewardTable, ({ one }) => ({
  group: one(groupTable, {
    fields: [rewardTable.groupId],
    references: [groupTable.id],
  }),
}));

// Validation
export const insertRewardSchema = createInsertSchema(rewardTable, {
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(2048),
  score: z.number().int().min(0),
  dueDate: z.date(),
  pathPhoto: z.string().max(256).optional(),
});

export const selectRewardSchema = createSelectSchema(rewardTable);

export type Reward = typeof rewardTable.$inferSelect;
export type NewReward = typeof rewardTable.$inferInsert;
