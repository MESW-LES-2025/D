import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from '@/schema/user';

export const organizationTable = pgTable('organization', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logo: text('logo'),
  createdAt: timestamp('created_at').notNull(),
  metadata: text('metadata'),
});

export const organizationRoleTable = pgTable(
  'organization_role',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    permission: text('permission').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(
      () => /* @__PURE__ */ new Date(),
    ),
  },
  table => [
    index('organizationRole_organizationId_idx').on(table.organizationId),
    index('organizationRole_role_idx').on(table.role),
  ],
);

export const memberTable = pgTable(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
    role: text('role').default('member').notNull(),
    createdAt: timestamp('created_at').notNull(),
  },
  table => [
    index('member_organizationId_idx').on(table.organizationId),
    index('member_userId_idx').on(table.userId),
  ],
);

export const invitationTable = pgTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizationTable.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role'),
    status: text('status').default('pending').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => userTable.id, { onDelete: 'cascade' }),
  },
  table => [
    index('invitation_organizationId_idx').on(table.organizationId),
    index('invitation_email_idx').on(table.email),
  ],
);

export const organizationRelations = relations(organizationTable, ({ many }) => ({
  organizationRoles: many(organizationRoleTable),
  members: many(memberTable),
  invitations: many(invitationTable),
}));

export const organizationRoleRelations = relations(
  organizationRoleTable,
  ({ one }) => ({
    organization: one(organizationTable, {
      fields: [organizationRoleTable.organizationId],
      references: [organizationTable.id],
    }),
  }),
);

export const memberRelations = relations(memberTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [memberTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [memberTable.userId],
    references: [userTable.id],
  }),
}));

export const invitationRelations = relations(invitationTable, ({ one }) => ({
  organization: one(organizationTable, {
    fields: [invitationTable.organizationId],
    references: [organizationTable.id],
  }),
  user: one(userTable, {
    fields: [invitationTable.inviterId],
    references: [userTable.id],
  }),
}));
