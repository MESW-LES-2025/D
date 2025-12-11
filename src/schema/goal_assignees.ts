import { pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { goalTable } from './goal';
import { userTable } from './user';

export const goalAssigneesTable = pgTable(
  'goal_assignees',
  {
    goalId: uuid('goal_id')
      .references(() => goalTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => userTable.id, { onDelete: 'cascade' })
      .notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.goalId, table.userId] }),
  }),
);
