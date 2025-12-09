'use server';

import type { Status } from '@/lib/task/task-types';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function updateTaskStatus(taskId: string, status: Status) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    await db
      .update(taskTable)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(taskTable.id, taskId));

    revalidatePath('/tasks');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task status:', error);
    return { error: 'Failed to update task status' };
  }
}
