'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { taskTable } from '@/schema';

export async function archiveTask(taskId: string) {
  try {
    await db
      .update(taskTable)
      .set({
        status: 'archived',
        updatedAt: new Date(),
      })
      .where(eq(taskTable.id, taskId));

    revalidatePath('/tasks');
    revalidatePath('/goals');

    return { success: true };
  } catch (error) {
    console.error('Error archiving task:', error);
    return { success: false, error: 'Failed to archive task' };
  }
}
