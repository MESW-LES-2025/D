'use server';

import type { Difficulty } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function updateTaskDifficulty(taskId: string, difficulty: Difficulty) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Get current task to check its status
    const [task] = await db
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, taskId))
      .limit(1);

    if (!task) {
      return { error: 'Task not found' };
    }

    // Only recalculate score if task is not completed
    // If task is done, score represents earned points and should not be changed
    if (task.status === 'done') {
      // Just update difficulty without changing score
      await db
        .update(taskTable)
        .set({ difficulty })
        .where(eq(taskTable.id, taskId));
    } else {
      // Calculate new base score based on difficulty
      const difficultyMultiplier = {
        easy: 1,
        medium: 2,
        hard: 3,
      };
      const baseScore = 10;
      const newScore = baseScore * difficultyMultiplier[difficulty];

      await db
        .update(taskTable)
        .set({ difficulty, score: newScore })
        .where(eq(taskTable.id, taskId));
    }

    revalidatePath('/tasks');
    revalidatePath('/api/tasks/stats');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task difficulty:', error);
    return { error: 'Failed to update task difficulty' };
  }
}
