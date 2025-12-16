import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTable } from '@/schema/user';

export const achievementIdEnum = pgEnum('achievement_id', [
  'first_steps',
  'task_master',
  'speed_demon',
  'consistency_king',
  'century_club',
  'perfectionist',
  'on_fire',
  'elite_achiever',
  'legendary',
]);

export const userAchievementsTable = pgTable('user_achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
  achievementId: achievementIdEnum('achievement_id').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});
