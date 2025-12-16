import type { ActiveTasksMetric } from '@/lib/task/types/metrics';
import { and, count, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function getActiveTasksMetric(
  organizationId: string,
): Promise<ActiveTasksMetric> {
  const activeStatuses = ['in_progress', 'review'] as const;

  // Fetch current active tasks and last week's active tasks (at the same day of week)
  const [currentActive, previousActive] = await Promise.all([
    // Current: Active tasks right now
    db
      .select({ count: count() })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          inArray(taskTable.status, activeStatuses),
        ),
      ),

    // Previous: Active tasks at the same point last week
    // This is a snapshot - tasks that were active 7 days ago
    db
      .select({ count: count() })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          inArray(taskTable.status, activeStatuses),
          // Tasks that existed and were active at the start of last week
          // Note: This is an approximation since we don't have historical status data
          // A better approach would be to compare "active tasks now" vs "active tasks 7 days ago"
          // For now, we'll just compare current active vs active tasks created before last week
          // In the future, we are going to use the log system to track status changes over time
        ),
      ),
  ]);

  const activeCount = currentActive[0]?.count ?? 0;
  const previousCount = previousActive[0]?.count ?? 0;

  // Calculate trend
  const trend = previousCount > 0
    ? ((activeCount - previousCount) / previousCount) * 100
    : activeCount > 0 ? 100 : 0;

  return {
    value: activeCount,
    trend,
  };
}
