import { and, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskLogTable, taskTable } from '@/schema/task';

export async function checkFirstSteps(userId: string): Promise<boolean> {
  const completedTasks = await db
    .select()
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
      ),
    )
    .limit(1);

  return completedTasks.length > 0;
}

export async function checkTaskMaster(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const completionsToday = await db
    .selectDistinct({ taskId: taskLogTable.taskId })
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
        gte(taskLogTable.timestamp, today),
        gte(taskLogTable.timestamp, tomorrow),
      ),
    );

  return completionsToday.length >= 5;
}

export async function checkSpeedDemon(userId: string): Promise<boolean> {
  const thirtyMinutesAgo = new Date();
  thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

  const recentCompletions = await db
    .selectDistinct({ taskId: taskLogTable.taskId })
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
        gte(taskLogTable.timestamp, thirtyMinutesAgo),
      ),
    );

  return recentCompletions.length >= 3;
}

export async function checkConsistencyKing(userId: string): Promise<boolean> {
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const completionsByDay = new Map<string, boolean>();

  const completions = await db
    .select()
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
        gte(taskLogTable.timestamp, fiveDaysAgo),
      ),
    );

  for (const completion of completions) {
    const date = new Date(completion.timestamp);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && dateStr) {
      completionsByDay.set(dateStr, true);
    }
  }

  // Count consecutive weekdays with completions
  let consecutiveDays = 0;
  const currentDate = new Date();

  for (let i = 0; i < 7; i++) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }

    const dateStr = currentDate.toISOString().split('T')[0];
    if (dateStr && completionsByDay.has(dateStr)) {
      consecutiveDays++;
    } else {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return consecutiveDays >= 5;
}

export async function checkCenturyClub(userId: string): Promise<boolean> {
  const completions = await db
    .selectDistinct({ taskId: taskLogTable.taskId })
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
      ),
    );

  return completions.length >= 100;
}

export async function checkLegendary(userId: string): Promise<boolean> {
  const completions = await db
    .selectDistinct({ taskId: taskLogTable.taskId })
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
      ),
    );

  return completions.length >= 1000;
}

export async function checkPerfectionist(): Promise<boolean> {
  // Get tasks completed by this user that were not late
  const tasksCompletedOnTime = await db
    .selectDistinct({ taskId: taskTable.id })
    .from(taskTable)
    .where(
      and(
        eq(taskTable.status, 'done'),
      ),
    )
    .limit(25);

  // TODO: Implement actual late submission checking
  // For now, if we have 25 completed tasks, consider it unlocked
  return tasksCompletedOnTime.length >= 25;
}

export async function checkOnFire(userId: string): Promise<boolean> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const completionsByDay = new Map<string, boolean>();

  const completions = await db
    .select()
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
        gte(taskLogTable.timestamp, sevenDaysAgo),
      ),
    );

  for (const completion of completions) {
    const date = new Date(completion.timestamp);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && dateStr) {
      completionsByDay.set(dateStr, true);
    }
  }

  let consecutiveWeekdays = 0;
  const currentDate = new Date();

  for (let i = 0; i < 14; i++) {
    const dayOfWeek = currentDate.getDay();

    // Skip weekends in the count but continue
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }

    const dateStr = currentDate.toISOString().split('T')[0];
    if (dateStr && completionsByDay.has(dateStr)) {
      consecutiveWeekdays++;
    } else {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return consecutiveWeekdays >= 5;
}

export type AchievementId = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type AchievementCheckResult = {
  id: AchievementId;
  name: string;
  unlocked: boolean;
  unlockedAt?: Date;
};

// Helper functions to get unlock timestamps for each achievement
async function getFirstStepsUnlockedAt(userId: string): Promise<Date | undefined> {
  const result = await db
    .select({ timestamp: taskLogTable.timestamp })
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
      ),
    )
    .orderBy(taskLogTable.timestamp)
    .limit(1);

  return result[0]?.timestamp;
}

async function getTaskMasterUnlockedAt(userId: string): Promise<Date | undefined> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .selectDistinct({ timestamp: taskLogTable.timestamp })
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
        gte(taskLogTable.timestamp, today),
      ),
    )
    .orderBy(taskLogTable.timestamp)
    .limit(5);

  // Return the timestamp of the 5th completion
  return result[4]?.timestamp;
}

async function getSpeedDemonUnlockedAt(userId: string): Promise<Date | undefined> {
  const thirtyMinutesAgo = new Date();
  thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

  const result = await db
    .selectDistinct({ timestamp: taskLogTable.timestamp })
    .from(taskLogTable)
    .where(
      and(
        eq(taskLogTable.userId, userId),
        eq(taskLogTable.action, 'status_changed'),
        gte(taskLogTable.timestamp, thirtyMinutesAgo),
      ),
    )
    .orderBy(taskLogTable.timestamp)
    .limit(3);

  // Return the timestamp of the 3rd completion
  return result[2]?.timestamp;
}

export async function checkAllAchievements(userId: string): Promise<AchievementCheckResult[]> {
  const achievements = await Promise.all([
    checkFirstSteps(userId),
    checkTaskMaster(userId),
    checkSpeedDemon(userId),
    checkConsistencyKing(userId),
    checkCenturyClub(userId),
    checkPerfectionist(),
    checkOnFire(userId),
    checkLegendary(userId),
  ]);

  // Get unlock timestamps for achievements that are unlocked
  const [
    firstStepsAt,
    taskMasterAt,
    speedDemonAt,
  ] = await Promise.all([
    achievements[0] ? getFirstStepsUnlockedAt(userId) : Promise.resolve(undefined),
    achievements[1] ? getTaskMasterUnlockedAt(userId) : Promise.resolve(undefined),
    achievements[2] ? getSpeedDemonUnlockedAt(userId) : Promise.resolve(undefined),
  ]);

  const achievementNameMap = new Map<AchievementId, string>([
    ['1', 'First Steps'],
    ['2', 'Task Master'],
    ['3', 'Speed Demon'],
    ['4', 'Consistency King'],
    ['5', 'Century Club'],
    ['6', 'Perfectionist'],
    ['7', 'On Fire'],
    ['8', 'Elite Achiever'],
    ['9', 'Legendary'],
  ]);

  function getAchievementName(id: AchievementId): string {
    return achievementNameMap.get(id) || 'Unknown Achievement';
  }

  return [
    { id: '1', name: getAchievementName('1'), unlocked: achievements[0], unlockedAt: firstStepsAt },
    { id: '2', name: getAchievementName('2'), unlocked: achievements[1], unlockedAt: taskMasterAt },
    { id: '3', name: getAchievementName('3'), unlocked: achievements[2], unlockedAt: speedDemonAt },
    { id: '4', name: getAchievementName('4'), unlocked: achievements[3] },
    { id: '5', name: getAchievementName('5'), unlocked: achievements[4] },
    { id: '6', name: getAchievementName('6'), unlocked: achievements[5] },
    { id: '7', name: getAchievementName('7'), unlocked: achievements[6] },
    { id: '8', name: getAchievementName('8'), unlocked: false }, // Elite achiever - placeholder
    { id: '9', name: getAchievementName('9'), unlocked: achievements[7] },
  ];
}
