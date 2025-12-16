'use server';

import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable, goalTasksTable } from '@/schema/goal';

export async function updateGoal(
  goalId: string,
  data: {
    title: string;
    description?: string;
    pointsReward?: string;
    dueDate?: string;
    assigneeIds?: string[];
    taskIds?: string[];
  },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  if (!session.session?.activeOrganizationId) {
    return { error: 'No active organization' };
  }

  try {
    const points = data.pointsReward ? Number.parseInt(data.pointsReward, 10) : 0;

    const updates: any = {
      name: data.title,
    };

    if (data.description) {
      updates.description = data.description;
    }
    if (points > 0) {
      updates.points = points;
    }
    if (data.dueDate) {
      updates.dueDate = new Date(data.dueDate);
    } else {
      updates.dueDate = null;
    }

    const [updated] = await db
      .update(goalTable)
      .set(updates)
      .where(eq(goalTable.id, goalId))
      .returning();

    // Update assignees - delete old ones and insert new ones
    if (data.assigneeIds && Array.isArray(data.assigneeIds)) {
      // Delete existing assignees for this goal
      await db.delete(goalAssigneesTable).where(eq(goalAssigneesTable.goalId, goalId));

      // Insert new assignees
      if (data.assigneeIds.length > 0) {
        const assigneeRows = data.assigneeIds.map((userId: string) => ({
          goalId,
          userId,
        }));
        await db.insert(goalAssigneesTable).values(assigneeRows);
      }
    }

    // Update task associations - delete old ones and insert new ones
    if (data.taskIds && Array.isArray(data.taskIds)) {
      // If there are goal assignees, validate that for each task, at least one goal assignee is assigned
      if (data.assigneeIds && data.assigneeIds.length > 0 && data.taskIds.length > 0) {
        const taskAssignments = await db
          .select({
            taskId: taskAssigneesTable.taskId,
            userId: taskAssigneesTable.userId,
          })
          .from(taskAssigneesTable)
          .where(inArray(taskAssigneesTable.taskId, data.taskIds));

        // For each task, check if at least one goal assignee is assigned to it
        for (const taskId of data.taskIds) {
          const taskAssigneeIds = new Set(
            taskAssignments
              .filter(ta => ta.taskId === taskId)
              .map(ta => ta.userId),
          );

          const hasCompatibleAssignee = data.assigneeIds.some((id: string) => taskAssigneeIds.has(id));

          if (!hasCompatibleAssignee) {
            return {
              error: `No goal member is assigned to this task. Please ensure at least one goal member is assigned to every task.`,
            };
          }
        }
      }

      // Delete all existing associations for this goal
      await db.delete(goalTasksTable).where(eq(goalTasksTable.goalId, goalId));

      // Insert new associations
      if (data.taskIds.length > 0) {
        const rows = data.taskIds.map((tid: string) => ({ goalId, taskId: tid }));
        await db.insert(goalTasksTable).values(rows);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/goals');

    return { success: true, data: updated };
  } catch (e) {
    console.error('Failed to update goal:', e);
    return { error: 'Failed to update goal' };
  }
}
