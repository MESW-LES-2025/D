import type { DateRange, PointsEarnedMetric } from '../types/metrics';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskAssigneesTable, taskTable } from '@/schema/task';

export async function getPointsEarnedMetric(
  organizationId: string,
  userId: string,
  currentWeek: DateRange,
  lastWeek: DateRange,
): Promise<PointsEarnedMetric> {
  // Fetch user and team points for current and previous weeks
  const [
    currentUserPoints,
    currentTeamPoints,
    previousUserPoints,
  ] = await Promise.all([
    // Current week: User's points from completed assigned tasks
    db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${taskTable.score}), 0)`,
      })
      .from(taskTable)
      .innerJoin(taskAssigneesTable, eq(taskTable.id, taskAssigneesTable.taskId))
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskAssigneesTable.userId, userId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, currentWeek.start),
        ),
      ),

    // Current week: Team's total points from completed tasks
    db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${taskTable.score}), 0)`,
      })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, currentWeek.start),
        ),
      ),

    // Previous week: User's points
    db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${taskTable.score}), 0)`,
      })
      .from(taskTable)
      .innerJoin(taskAssigneesTable, eq(taskTable.id, taskAssigneesTable.taskId))
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskAssigneesTable.userId, userId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, lastWeek.start),
          lt(taskTable.updatedAt, lastWeek.end),
        ),
      ),

    // Previous week: Team's total points
    db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${taskTable.score}), 0)`,
      })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, lastWeek.start),
          lt(taskTable.updatedAt, lastWeek.end),
        ),
      ),
  ]);

  const userPoints = currentUserPoints[0]?.totalPoints ?? 0;
  const teamPoints = currentTeamPoints[0]?.totalPoints ?? 0;
  const previousUserPointsValue = previousUserPoints[0]?.totalPoints ?? 0;

  // Calculate trend based on user's points
  const trend = previousUserPointsValue > 0
    ? ((userPoints - previousUserPointsValue) / previousUserPointsValue) * 100
    : userPoints > 0 ? 100 : 0;

  return {
    value: userPoints,
    userPoints,
    teamPoints,
    trend,
  };
}
