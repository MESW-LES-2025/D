import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';

export const goalTasksTable = pgTable(
  'goal_tasks',
  {
    goalId: uuid('goal_id').notNull(),
    taskId: uuid('task_id').notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.goalId, table.taskId] }),
  }),
);
