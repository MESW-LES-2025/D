'use server';

import type { Priority } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { calculateTaskPoints } from '@/lib/utils/calculateTaskPoints';
import { adjustPointsForPropertyChange } from '@/lib/utils/pointTransactionHelpers';
import { taskTable } from '@/schema/task';

export async function updateTaskPriority(taskId: string, priority: Priority) {
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
      })
      .from(taskTable)
      .where(eq(taskTable.id, taskId))
      .limit(1);

    if (!task) {
      return { error: 'Task not found' };
    }

    // If task is done, recalculate score with new priority
    if (task.status === 'done') {
      const oldScore = task.score;
      const newScore = await calculateTaskPoints(
        priority,
        task.difficulty,
        task.dueDate,
        'done',
      );

      await db
        .update(taskTable)
        .set({ priority, score: newScore })
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
            property: 'priority',
            oldValue: task.priority,
            newValue: priority,
            difficulty: task.difficulty,
            dueDate: task.dueDate?.toISOString(),
          },
        );
      }
    } else {
      // Just update priority without changing score for non-done tasks
      await db
        .update(taskTable)
        .set({ priority })
        .where(eq(taskTable.id, taskId));
    }

    revalidatePath('/tasks');
    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task priority:', error);
    return { error: 'Failed to update task priority' };
  }
}
