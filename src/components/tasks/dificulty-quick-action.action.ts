'use server';

import type { Difficulty } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { calculateTaskPoints } from '@/lib/utils/calculateTaskPoints';
import { adjustPointsForPropertyChange } from '@/lib/utils/pointTransactionHelpers';
import { taskTable } from '@/schema';
// import { taskAssigneesTable, taskTable } from '@/schema/task';

type TaskWithStatus = {
  id: string;
  status: string;
  score: number;
  dueDate?: Date | null;
};

export async function updateTaskDifficulty(taskId: string, difficulty: Difficulty, task: TaskWithStatus) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) {
    return { error: 'No active organization' };
  }

  try {
    // If task is done, recalculate score with new difficulty
    if (task.status === 'done') {
      // Fetch full task data including priority
      const [fullTask] = await db
        .select({
          id: taskTable.id,
          title: taskTable.title,
          priority: taskTable.priority,
          difficulty: taskTable.difficulty,
          dueDate: taskTable.dueDate,
        })
        .from(taskTable)
        .where(eq(taskTable.id, taskId))
        .limit(1);

      if (!fullTask) {
        return { error: 'Task not found' };
      }

      const oldScore = task.score;
      const newScore = await calculateTaskPoints(
        fullTask.priority,
        difficulty,
        fullTask.dueDate,
        'done',
      );

      await db
        .update(taskTable)
        .set({ difficulty, score: newScore })
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
            taskTitle: fullTask.title,
            property: 'difficulty',
            oldValue: fullTask.difficulty,
            newValue: difficulty,
            priority: fullTask.priority,
            dueDate: fullTask.dueDate?.toISOString(),
          },
        );
      }
    } else {
      // Just update difficulty without changing score for non-done tasks
      await db
        .update(taskTable)
        .set({ difficulty })
        .where(eq(taskTable.id, taskId));
    }

    revalidatePath('/tasks');
    revalidatePath('/goals');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task difficulty:', error);
    return { error: 'Failed to update task difficulty' };
  }
}
