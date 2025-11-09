import { relations } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { groupTable } from './group';
import { groupMemberTable } from './groupMember';
import { userTable } from './user';

// Enuns
export const statusEnum = pgEnum('status', ['to_do', 'in_progress', 'completed']);
export const priorityEnum = pgEnum('priorities', ['low', 'normal', 'high', 'critial']);

// Table
export const taskTable = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groupTable.id),
  userId: text('user_id').references(() => userTable.id),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 2048 }).notNull(),
  priority: priorityEnum('priority').notNull(),
  status: statusEnum('status').notNull(),
  score: integer('score').notNull(),
  dueDate: timestamp('due_date').notNull(),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  removedAt: timestamp('removed_at'),
}, table => ({
  groupIdIdx: index('tasks_group_id_index').on(table.groupId),
  userIdIdx: index('tasks_user_id_index').on(table.userId),
}));

// Relations
export const usersRelations = relations(taskTable, ({ many }) => ({
  groupMemberships: many(groupMemberTable),
  tasks: many(taskTable),
}));

export const tasksRelations = relations(taskTable, ({ one }) => ({
  group: one(groupTable, {
    fields: [taskTable.groupId],
    references: [groupTable.id],
  }),
  assignedUser: one(taskTable, {
    fields: [taskTable.userId],
    references: [taskTable.id],
  }),
}));

// Validation
export const insertTaskSchema = createInsertSchema(taskTable, {
  name: z.string().min(1).max(256),
  description: z.string().min(1).max(2048),
  score: z.number().int().min(0),
  dueDate: z.date(),
});

export const selectTaskSchema = createSelectSchema(taskTable);

export type Status = 'to_do' | 'in_progress' | 'completed';
export type Priority = 'low' | 'normal' | 'high' | 'critial';

export type Task = typeof taskTable.$inferSelect;
export type NewTask = typeof taskTable.$inferInsert;
