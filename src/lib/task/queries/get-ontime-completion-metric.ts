import type { DateRange, OnTimeCompletionMetric } from '@/lib/task/types/date-range';
import { and, count, eq, gte, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function getOnTimeCompletionMetric(
  organizationId: string,
  currentWeek: DateRange,
  lastWeek: DateRange,
): Promise<OnTimeCompletionMetric> {
  // Fetch completed tasks and on-time completed tasks for both weeks
  const [
    currentCompleted,
    currentOnTime,
    previousCompleted,
    previousOnTime,
  ] = await Promise.all([
    // Current week: All completed tasks
    db
      .select({ count: count() })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, currentWeek.start),
        ),
      ),

    // Current week: Completed tasks that were on-time (completed <= due date)
    db
      .select({ count: count() })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, currentWeek.start),
          sql`${taskTable.updatedAt} <= ${taskTable.dueDate}`,
        ),
      ),

    // Previous week: All completed tasks
    db
      .select({ count: count() })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, lastWeek.start),
          lt(taskTable.updatedAt, lastWeek.end),
        ),
      ),

    // Previous week: Completed tasks that were on-time
    db
      .select({ count: count() })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskTable.status, 'done'),
          gte(taskTable.updatedAt, lastWeek.start),
          lt(taskTable.updatedAt, lastWeek.end),
          sql`${taskTable.updatedAt} <= ${taskTable.dueDate}`,
        ),
      ),
  ]);

  const totalCompletedCurrent = currentCompleted[0]?.count ?? 0;
  const onTimeCurrent = currentOnTime[0]?.count ?? 0;
  const totalCompletedPrevious = previousCompleted[0]?.count ?? 0;
  const onTimePrevious = previousOnTime[0]?.count ?? 0;

  // Calculate rates as percentages
  const currentRate = totalCompletedCurrent > 0
    ? Math.round((onTimeCurrent / totalCompletedCurrent) * 100)
    : 0;

  const previousRate = totalCompletedPrevious > 0
    ? Math.round((onTimePrevious / totalCompletedPrevious) * 100)
    : 0;

  // Calculate trend (percentage point change)
  const trend = previousRate > 0
    ? ((currentRate - previousRate) / previousRate) * 100
    : currentRate > 0 ? 100 : 0;

  return {
    value: currentRate,
    rate: currentRate,
    trend,
  };
}
