'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskAssigneesTable } from '@/schema/task';

export async function assignUserToTask(taskId: string, userId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Check if already assigned
    const existing = await db
      .select()
      .from(taskAssigneesTable)
      .where(
        and(
          eq(taskAssigneesTable.taskId, taskId),
          eq(taskAssigneesTable.userId, userId),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return { error: 'User already assigned to this task' };
    }

    // Add the assignee
    await db.insert(taskAssigneesTable).values({
      taskId,
      userId,
    });

    revalidatePath('/tasks');

    return { success: true };
  } catch (error) {
    console.error('Failed to assign user to task:', error);
    return { error: 'Failed to assign user to task' };
  }
}
