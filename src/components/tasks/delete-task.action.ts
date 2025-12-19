'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { taskTable } from '@/schema';

export async function deleteTask(taskId: string) {
  try {
    // Hard delete - permanently remove the task
    await db
      .delete(taskTable)
      .where(eq(taskTable.id, taskId));

    revalidatePath('/tasks');
    revalidatePath('/goals');

    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}
