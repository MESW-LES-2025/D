'use server';

import type { Status } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { calculateTaskPoints } from '@/lib/utils/calculateTaskPoints';
import { taskTable } from '@/schema/task';

export async function updateTaskStatus(taskId: string, status: Status) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Fetch the current task if marking as done
    let score: number | undefined;
    if (status === 'done') {
      const [task] = await db
        .select()
        .from(taskTable)
        .where(eq(taskTable.id, taskId))
        .limit(1);

      if (task?.score && task.score > 0) {
        score = await calculateTaskPoints(task.score, status, task.dueDate);
        console.error(`[Points Calculation] Task ${taskId}: base=${task.score}, due=${task.dueDate?.toISOString()}, earned=${score}`);
      }
    }

    // Update task status and score if applicable
    if (score !== undefined) {
      await db
        .update(taskTable)
        .set({ status, score })
        .where(eq(taskTable.id, taskId));
    } else {
      await db
        .update(taskTable)
        .set({ status })
        .where(eq(taskTable.id, taskId));
    }

    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update task status' };
  }
}
