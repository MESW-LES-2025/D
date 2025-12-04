'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { taskTable } from '@/schema';

export async function deleteTask(taskId: string) {
  try {
    // Soft delete by setting status to 'deleted'
    await db
      .update(taskTable)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where(eq(taskTable.id, taskId));

    revalidatePath('/tasks');

    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}
