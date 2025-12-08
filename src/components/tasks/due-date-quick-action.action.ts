'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function updateTaskDueDate(taskId: string, dueDate: Date) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    await db
      .update(taskTable)
      .set({ dueDate })
      .where(eq(taskTable.id, taskId));

    revalidatePath('/tasks');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task due date:', error);
    return { error: 'Failed to update task due date' };
  }
}
