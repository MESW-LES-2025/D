import { boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from './user';

export const notificationTypeEnum = pgEnum('notification_type', ['deadline_update', 'goal']);

export const notificationTable = pgTable('notification', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => userTable.id),
  type: notificationTypeEnum('type').notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  read: boolean('read').default(false).notNull(),
});
