import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user';

export const taskPriorityEnum = pgEnum('task_priority', ['low', 'normal', 'high', 'urgent']);
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done', 'archived']);
export const taskDifficultyEnum = pgEnum('task_difficulty', ['easy', 'medium', 'hard']);

export const taskTable = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: text('group_id'),
  userId: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
  assigneeId: text('assignee_id').references(() => userTable.id, { onDelete: 'set null' }),
  createdById: text('created_by_id').references(() => userTable.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  priority: taskPriorityEnum('priority').default('normal').notNull(),
  difficulty: taskDifficultyEnum('difficulty').default('medium').notNull(),
  status: taskStatusEnum('status').default('todo').notNull(),
  score: integer('score').default(0).notNull(),
  dueDate: timestamp('due_date', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  removedAt: timestamp('removed_at', { mode: 'date' }),
});
