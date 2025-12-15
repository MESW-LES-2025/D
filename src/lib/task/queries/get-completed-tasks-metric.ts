import type { CompletedTasksMetric, DateRange } from '@/lib/task/types/date-range';
import { and, count, eq, gte, inArray, lt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function getCompletedTasksMetric(
  organizationId: string,
  currentWeek: DateRange,
  lastWeek: DateRange,
): Promise<CompletedTasksMetric> {
  // Fetch current week completed, last week completed, and total active tasks
  const [currentCompleted, previousCompleted, totalTasks] = await Promise.all([
    // Current week completed tasks
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

    // Previous week completed tasks
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

    // Total tasks (all non-archived/canceled tasks)
    db
      .select({ count: count() })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          inArray(taskTable.status, ['backlog', 'todo', 'in_progress', 'review', 'done']),
        ),
      ),
  ]);

  const completedCount = currentCompleted[0]?.count ?? 0;
  const previousCount = previousCompleted[0]?.count ?? 0;
  const total = totalTasks[0]?.count ?? 0;

  // Calculate trend
  const trend = previousCount > 0
    ? ((completedCount - previousCount) / previousCount) * 100
    : completedCount > 0 ? 100 : 0;

  return {
    value: completedCount,
    total,
    trend,
  };
}
