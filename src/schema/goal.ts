import { integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user';

export const goalStatusEnum = pgEnum('goal_status', ['active', 'paused', 'completed', 'archived']);

export const goalTable = pgTable('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: text('group_id'),
  userId: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
  assigneeId: text('assignee_id').references(() => userTable.id, { onDelete: 'set null' }),
  createdById: text('created_by_id').references(() => userTable.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  target: text('target'),
  reward: text('reward'),
  status: goalStatusEnum('status').default('active').notNull(),
  points: integer('points').default(0).notNull(),
  dueDate: timestamp('due_date', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  removedAt: timestamp('removed_at', { mode: 'date' }),
});

export const goalTasksTable = pgTable('goal_tasks', {
  goalId: uuid('goal_id').notNull(),
  taskId: uuid('task_id').notNull(),
}, table => [
  primaryKey({ columns: [table.goalId, table.taskId] }),
]);
