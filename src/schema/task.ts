import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { organizationTable } from '@/schema/organization';
import { userTable } from '@/schema/user';

export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);
export const taskStatusEnum = pgEnum('task_status', ['backlog', 'todo', 'in_progress', 'review', 'done', 'archived', 'canceled']);
export const taskDifficultyEnum = pgEnum('task_difficulty', ['easy', 'medium', 'hard']);
export const taskLogActionEnum = pgEnum('task_log_action', ['created', 'updated', 'deleted', 'status_changed', 'priority_changed', 'difficulty_changed', 'assigned', 'unassigned', 'label_added', 'label_removed', 'comment_added']);
export const taskLabelColorEnum = pgEnum('task_label_color', ['gray', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']);

export const taskTable = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tittle: text('tittle').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('backlog').notNull(),
  creatorId: text('creator_id').references(() => userTable.id, { onDelete: 'set null' }),
  organizationId: text('organization_id').references(() => organizationTable.id, { onDelete: 'set null' }),
  priority: taskPriorityEnum('priority').default('medium').notNull(),
  difficulty: taskDifficultyEnum('difficulty').default('medium').notNull(),
  dueDate: timestamp('due_date', { mode: 'date' }),
  score: integer('score').default(0).notNull(),
});

export const taskLabelsTable = pgTable('task_labels', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  color: taskLabelColorEnum('color').default('gray').notNull(),
  organizationId: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
});

export const taskAssigneesTable = pgTable('task_assignees', {
  taskId: uuid('task_id').references(() => taskTable.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
}, table => ({
  pk: primaryKey({ columns: [table.taskId, table.userId] }),
}));

export const taskLogTable = pgTable('task_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  taskId: uuid('task_id').references(() => taskTable.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => userTable.id, { onDelete: 'set null' }),
  action: taskLogActionEnum('action').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Relations
export const taskTableRelations = relations(taskTable, ({ many }) => ({
  assignees: many(taskAssigneesTable),
}));

export const taskAssigneesTableRelations = relations(taskAssigneesTable, ({ one }) => ({
  task: one(taskTable, {
    fields: [taskAssigneesTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [taskAssigneesTable.userId],
    references: [userTable.id],
  }),
}));
