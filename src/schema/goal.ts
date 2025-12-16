import { integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizationTable } from './organization';
import { taskTable } from './task';
import { userTable } from './user';

export const goalStatusEnum = pgEnum('goal_status', ['active', 'paused', 'completed', 'archived']);

export const goalTable = pgTable('goals', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: text('organization_id').references(() => organizationTable.id, { onDelete: 'set null' }),
  creatorId: text('creator_id').references(() => userTable.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  status: goalStatusEnum('status').default('active').notNull(),
  points: integer('points').default(0).notNull(),
  dueDate: timestamp('due_date', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const goalTasksTable = pgTable(
  'goal_tasks',
  {
    goalId: uuid('goal_id')
      .references(() => goalTable.id, { onDelete: 'cascade' })
      .notNull(),

    taskId: uuid('task_id')
      .references(() => taskTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  table => ([
    primaryKey({ columns: [table.goalId, table.taskId] }),
  ]),
);
