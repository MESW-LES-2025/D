'use server';

import type { Status } from '@/lib/task/task-types';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { calculateTaskPoints } from '@/lib/utils/calculateTaskPoints';
import {
  awardPointsToAssignees,
  deductPointsFromAssignees,
} from '@/lib/utils/pointTransactionHelpers';
import { taskAssigneesTable, taskTable } from '@/schema/task';

export async function updateTaskStatus(taskId: string, status: Status) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) {
    return { error: 'No active organization' };
  }

  try {
    // Fetch the task with current status and assignee count
    const [task] = await db
      .select({
        id: taskTable.id,
        title: taskTable.title,
        status: taskTable.status,
        difficulty: taskTable.difficulty,
        priority: taskTable.priority,
        dueDate: taskTable.dueDate,
        score: taskTable.score,
        assigneeCount: sql<number>`cast(count(distinct ${taskAssigneesTable.userId}) as integer)`.as('assignee_count'),
      })
      .from(taskTable)
      .leftJoin(taskAssigneesTable, eq(taskTable.id, taskAssigneesTable.taskId))
      .where(eq(taskTable.id, taskId))
      .groupBy(
        taskTable.id,
        taskTable.title,
        taskTable.status,
        taskTable.difficulty,
        taskTable.priority,
        taskTable.dueDate,
        taskTable.score,
      )
      .limit(1);

    if (!task) {
      return { error: 'Task not found' };
    }

    const oldStatus = task.status;

    const score = await calculateTaskPoints(
      task.priority,
      task.difficulty,
      task.dueDate,
      task.assigneeCount ?? 0,
      status,
    );

    // Update task status and score
    await db
      .update(taskTable)
      .set({
        status,
        updatedAt: new Date(),
        score,
      })
      .where(eq(taskTable.id, taskId));

    // Handle point transactions based on status change
    const isBecomingDone = status === 'done' && oldStatus !== 'done';
    const isBecomingNotDone = status !== 'done' && oldStatus === 'done';

    if (isBecomingDone && score > 0) {
      // Task is being marked as done - award points to all assignees
      await awardPointsToAssignees(
        taskId,
        orgId,
        score,
        'task_completed',
        {
          taskTitle: task.title,
          priority: task.priority,
          difficulty: task.difficulty,
          dueDate: task.dueDate?.toISOString(),
          previousStatus: oldStatus,
          newStatus: status,
        },
      );
    } else if (isBecomingNotDone && task.score > 0) {
      // Task is being unmarked - deduct points from all assignees
      await deductPointsFromAssignees(
        taskId,
        orgId,
        task.score, // Use the old score
        'task_uncompleted',
        {
          taskTitle: task.title,
          priority: task.priority,
          difficulty: task.difficulty,
          dueDate: task.dueDate?.toISOString(),
          previousStatus: oldStatus,
          newStatus: status,
        },
      );
    }

    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true, score };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update task status' };
  }
}
