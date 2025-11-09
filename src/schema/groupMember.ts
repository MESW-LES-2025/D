import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { groupTable } from './group';
import { taskTable } from './task';
import { userTable } from './user';

// Enuns
export const roleEnum = pgEnum('roles', ['administrator', 'member']);

// Table
export const groupMemberTable = pgTable('groups_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groupTable.id),
  userId: uuid('user_id').notNull().references(() => userTable.id),
  roleId: roleEnum('role_id'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  removedAt: timestamp('removed_at'),
}, table => ({
  groupIdIdx: index('groups_members_group_id_index').on(table.groupId),
  userIdIdx: index('groups_members_user_id_index').on(table.userId),
}));

// Relations
export const groupsMembersRelations = relations(groupMemberTable, ({ one }) => ({
  group: one(groupTable, {
    fields: [groupMemberTable.groupId],
    references: [groupTable.id],
  }),
  user: one(taskTable, {
    fields: [groupMemberTable.userId],
    references: [taskTable.id],
  }),
}));

// Validation
export const insertGroupMemberSchema = createInsertSchema(groupMemberTable);
export const selectGroupMemberSchema = createSelectSchema(groupMemberTable);

export type Role = 'administrator' | 'member';
export type GroupMember = typeof groupMemberTable.$inferSelect;
export type NewGroupMember = typeof groupMemberTable.$inferInsert;
