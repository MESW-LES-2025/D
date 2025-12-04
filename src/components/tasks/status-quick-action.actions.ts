'use server';

import type { Status } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { calculatePointsWithTimingBonus } from '@/lib/utils/pointCalculator';
import { taskTable } from '@/schema/task';

export async function updateTaskStatus(taskId: string, status: Status) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // If marking as done, calculate bonus points based on due date
    if (status === 'done') {
      // Fetch the current task to get its score and due date
      const [task] = await db
        .select()
        .from(taskTable)
        .where(eq(taskTable.id, taskId))
        .limit(1);

      if (task?.score && task.score > 0) {
        // Calculate points with timing bonus
        const bonusPoints = calculatePointsWithTimingBonus(
          task.score,
          task.dueDate,
          new Date(),
        );

        console.error(`[Points Calculation] Task ${taskId}: base=${task.score}, due=${task.dueDate?.toISOString()}, earned=${bonusPoints}`);

        await db
          .update(taskTable)
          .set({ status, score: bonusPoints })
          .where(eq(taskTable.id, taskId));
      } else {
        await db
          .update(taskTable)
          .set({ status })
          .where(eq(taskTable.id, taskId));
      }
    } else {
      await db
        .update(taskTable)
        .set({ status })
        .where(eq(taskTable.id, taskId));
    }

    revalidatePath('/tasks');
    revalidatePath('/api/tasks/stats');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update task status' };
  }
}
