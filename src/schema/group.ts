import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const groupTable = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 128 }).notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  removedAt: timestamp('removed_at'),
});

// Zod schemas for validation
export const insertGroupSchema = createInsertSchema(groupTable, {
  name: z.string().min(1).max(128),
});

export const selectGroupSchema = createSelectSchema(groupTable);

export type Group = typeof groupTable.$inferSelect;
export type NewGroup = typeof groupTable.$inferInsert;
