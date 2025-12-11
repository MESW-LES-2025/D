'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { createDeadlineUpdateNotification } from '@/lib/notification/notification-helpers';
import { calculateTaskPoints } from '@/lib/utils/calculateTaskPoints';
import { adjustPointsForPropertyChange } from '@/lib/utils/pointTransactionHelpers';
import { taskAssigneesTable, taskTable } from '@/schema/task';

export async function updateTaskDueDate(taskId: string, dueDate: Date) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) {
    return { error: 'No active organization' };
  }

  try {
    // Fetch task data to check if it's done and get other properties
    const [task] = await db
      .select({
        id: taskTable.id,
        title: taskTable.title,
        status: taskTable.status,
        priority: taskTable.priority,
        difficulty: taskTable.difficulty,
        dueDate: taskTable.dueDate,
        score: taskTable.score,
        assigneeCount: sql<number>`cast(count(distinct ${taskAssigneesTable.userId}) as integer)`.as('assignee_count'),
      })
      .from(taskTable)
      .leftJoin(taskAssigneesTable, eq(taskTable.id, taskAssigneesTable.taskId))
      .where(eq(taskTable.id, taskId))
      .groupBy(taskTable.id, taskTable.title, taskTable.status, taskTable.priority, taskTable.difficulty, taskTable.dueDate, taskTable.score)
      .limit(1);

    if (!task) {
      return { error: 'Task not found' };
    }

    // If task is done, recalculate score with new due date
    if (task.status === 'done') {
      const oldScore = task.score;
      const newScore = await calculateTaskPoints(
        task.priority,
        task.difficulty,
        dueDate,
        task.assigneeCount ?? 0,
        'done',
      );

      await db
        .update(taskTable)
        .set({ dueDate, score: newScore })
        .where(eq(taskTable.id, taskId));

      // Adjust points for all assignees if score changed
      if (oldScore !== newScore) {
        await adjustPointsForPropertyChange(
          taskId,
          orgId,
          oldScore,
          newScore,
          'task_property_changed',
          {
            taskTitle: task.title,
            property: 'dueDate',
            oldValue: task.dueDate?.toISOString(),
            newValue: dueDate.toISOString(),
            priority: task.priority,
            difficulty: task.difficulty,
          },
        );
      }
    } else {
      // Just update due date without changing score for non-done tasks
      await db
        .update(taskTable)
        .set({ dueDate })
        .where(eq(taskTable.id, taskId));
    }

    // Get all assignees for the task
    const assignees = await db
      .select({ userId: taskAssigneesTable.userId })
      .from(taskAssigneesTable)
      .where(eq(taskAssigneesTable.taskId, taskId));

    // Create notifications for each assignee
    await Promise.all(
      assignees.map(assignee =>
        createDeadlineUpdateNotification(
          assignee.userId,
          taskId,
          task.title,
          dueDate.toISOString(),
          task.dueDate?.toISOString(),
        ),
      ),
    );

    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task due date:', error);
    return { error: 'Failed to update task due date' };
  }
}
