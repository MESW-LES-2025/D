'use server';

import type { Status } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { calculateTaskPoints, getTaskBaseScore } from '@/lib/utils/calculateTaskPoints';
import { taskTable } from '@/schema/task';

export async function updateTaskStatus(taskId: string, status: Status) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Fetch the task to calculate score based on difficulty
    const [task] = await db
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, taskId))
      .limit(1);

    if (!task) {
      return { error: 'Task not found' };
    }

    const baseScore = await getTaskBaseScore(task.difficulty);
    const score = await calculateTaskPoints(baseScore, status, task.dueDate);

    // Update task status and score
    await db
      .update(taskTable)
      .set({ status, score })
      .where(eq(taskTable.id, taskId));

    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true, score };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update task status' };
  }
}
