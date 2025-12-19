'use server';

import type { Status } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { revertGoalCompletion } from '@/app/(main)/dashboard/revert-goal-completion-actions';

import { checkAllAchievements } from '@/lib/achievements/achievement-checkers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { calculateTaskPoints } from '@/lib/utils/calculateTaskPoints';
import {
  awardPointsToAssignees,
  deductPointsFromAssignees,
} from '@/lib/utils/pointTransactionHelpers';
import { goalTable, goalTasksTable } from '@/schema/goal';
import { taskAssigneesTable, taskLogTable, taskTable } from '@/schema/task';

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
    // Fetch the task with current status
    const [task] = await db
      .select({
        id: taskTable.id,
        title: taskTable.title,
        status: taskTable.status,
        difficulty: taskTable.difficulty,
        priority: taskTable.priority,
        dueDate: taskTable.dueDate,
        score: taskTable.score,
      })
      .from(taskTable)
      .where(eq(taskTable.id, taskId))
      .limit(1);

    if (!task) {
      return { error: 'Task not found' };
    }

    const oldStatus = task.status;

    // Get assignee count for the response
    const assignees = await db
      .select({ userId: taskAssigneesTable.userId })
      .from(taskAssigneesTable)
      .where(eq(taskAssigneesTable.taskId, taskId));

    const score = await calculateTaskPoints(
      task.priority,
      task.difficulty,
      task.dueDate,
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

    // Log the status change
    await db
      .insert(taskLogTable)
      .values({
        taskId,
        userId: session.user?.id,
        action: 'status_changed',
      });

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

      // Check if this task is part of a completed goal - if so, revert the goal
      const goalsContainingTask = await db
        .select({ id: goalTable.id })
        .from(goalTasksTable)
        .innerJoin(goalTable, eq(goalTasksTable.goalId, goalTable.id))
        .where(eq(goalTasksTable.taskId, taskId));

      for (const goal of goalsContainingTask) {
        if (goal.id) {
          await revertGoalCompletion(goal.id);
        }
      }
    }

    revalidatePath('/tasks');
    revalidatePath('/goals');
    revalidatePath('/');

    const achievements = await checkAllAchievements(session.user?.id || '');
    const newlyUnlocked = achievements.filter(a => a.unlocked);

    return { success: true, score, assigneeCount: assignees.length, newlyUnlocked };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update task status' };
  }
}
