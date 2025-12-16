import type { TaskCompletionChartData } from '../types/chart-data';
import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function getTaskCompletionChartData(
  organizationId: string,
  daysBack: number = 90,
): Promise<TaskCompletionChartData[]> {
  // Calculate the start date (e.g., 90 days ago)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  startDate.setHours(0, 0, 0, 0);

  // Query to get completed tasks grouped by date and priority
  const results = await db
    .select({
      date: sql<string>`DATE(${taskTable.updatedAt})`,
      priority: taskTable.priority,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(taskTable)
    .where(
      and(
        eq(taskTable.organizationId, organizationId),
        eq(taskTable.status, 'done'),
        gte(taskTable.updatedAt, startDate),
      ),
    )
    .groupBy(sql`DATE(${taskTable.updatedAt})`, taskTable.priority)
    .orderBy(sql`DATE(${taskTable.updatedAt})`);

  // Transform the data into the format expected by the chart
  // Group by date and create an object with priority counts
  const dataMap = new Map<string, TaskCompletionChartData>();

  for (const row of results) {
    const date = row.date;

    if (!dataMap.has(date)) {
      dataMap.set(date, {
        date,
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      });
    }

    const data = dataMap.get(date)!;

    // Add the count to the appropriate priority
    if (row.priority === 'urgent') {
      data.urgent = row.count;
    } else if (row.priority === 'high') {
      data.high = row.count;
    } else if (row.priority === 'medium') {
      data.medium = row.count;
    } else if (row.priority === 'low') {
      data.low = row.count;
    }
  }

  // Fill in missing dates with zero values
  const chartData: TaskCompletionChartData[] = [];
  const currentDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  while (currentDate.getTime() <= today.getTime()) {
    const dateStr = currentDate.toISOString().split('T')[0]!;

    if (dataMap.has(dateStr)) {
      chartData.push(dataMap.get(dateStr)!);
    } else {
      chartData.push({
        date: dateStr,
        urgent: 0,
        high: 0,
        medium: 0,
        low: 0,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return chartData;
}
