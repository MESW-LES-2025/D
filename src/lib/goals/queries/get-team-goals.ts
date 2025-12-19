import type { TeamGoalData } from '../types/goal';
import { and, asc, count, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { goalTable, goalTasksTable } from '@/schema/goal';
import { taskTable } from '@/schema/task';

export async function getTeamGoals(
  organizationId: string,
  limit: number = 4,
): Promise<TeamGoalData[]> {
  // Fetch active goals for the team (groupId matches organizationId)
  const goals = await db
    .select()
    .from(goalTable)
    .where(
      and(
        eq(goalTable.organizationId, organizationId),
        eq(goalTable.status, 'active'),
      ),
    )
    .orderBy(asc(goalTable.dueDate))
    .limit(limit);

  // Transform to TeamGoalData format
  return Promise.all(
    goals.map(async (goal) => {
      // Count total tasks linked to this goal
      const taskCountResult = await db
        .select({ count: count() })
        .from(goalTasksTable)
        .where(eq(goalTasksTable.goalId, goal.id));

      const taskCount = taskCountResult[0]?.count || 0;

      // Count finalised tasks (done, archived, or canceled)
      const completedTasksResult = await db
        .select({ count: count() })
        .from(goalTasksTable)
        .innerJoin(taskTable, eq(goalTasksTable.taskId, taskTable.id))
        .where(
          and(
            eq(goalTasksTable.goalId, goal.id),
            inArray(taskTable.status, ['done', 'archived', 'canceled']),
          ),
        );

      const completedTasksCount = completedTasksResult[0]?.count || 0;

      return {
        id: goal.id,
        title: goal.name,
        description: goal.description || '',
        currentValue: completedTasksCount,
        targetValue: taskCount,
        status: goal.status,
        dueDate: goal.dueDate,
        completedAt: goal.completedAt,
      };
    }),
  );
}
