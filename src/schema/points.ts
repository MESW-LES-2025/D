import { relations } from 'drizzle-orm';
import { integer, pgEnum, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { organizationTable } from '@/schema/organization';
import { taskTable } from '@/schema/task';
import { userTable } from '@/schema/user';

// Enum for point transaction types
export const pointTransactionTypeEnum = pgEnum('point_transaction_type', [
  'task_completed',
  'task_uncompleted',
  'task_property_changed',
]);

// User points table - stores total points per user per organization
export const userPointsTable = pgTable('user_points', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  organizationId: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  totalPoints: integer('total_points').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, table => ({
  // Unique constraint: one row per user per organization
  uniqueUserOrg: unique().on(table.userId, table.organizationId),
}));

// Point transactions table - audit trail of all point changes
export const pointTransactionsTable = pgTable('point_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => userTable.id, { onDelete: 'cascade' }).notNull(),
  organizationId: text('organization_id').references(() => organizationTable.id, { onDelete: 'cascade' }).notNull(),
  taskId: uuid('task_id').references(() => taskTable.id, { onDelete: 'set null' }), // Can be null if task deleted
  transactionType: pointTransactionTypeEnum('transaction_type').notNull(),
  pointsChange: integer('points_change').notNull(), // Positive for gain, negative for loss
  previousTotal: integer('previous_total').notNull(),
  newTotal: integer('new_total').notNull(),
  metadata: text('metadata'), // JSON string with additional context
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const userPointsTableRelations = relations(userPointsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [userPointsTable.userId],
    references: [userTable.id],
  }),
  organization: one(organizationTable, {
    fields: [userPointsTable.organizationId],
    references: [organizationTable.id],
  }),
}));

export const pointTransactionsTableRelations = relations(pointTransactionsTable, ({ one }) => ({
  user: one(userTable, {
    fields: [pointTransactionsTable.userId],
    references: [userTable.id],
  }),
  organization: one(organizationTable, {
    fields: [pointTransactionsTable.organizationId],
    references: [organizationTable.id],
  }),
  task: one(taskTable, {
    fields: [pointTransactionsTable.taskId],
    references: [taskTable.id],
  }),
}));
