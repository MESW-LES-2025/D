'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { createDeadlineUpdateNotification } from '@/lib/notification/notification-helpers';
import { taskAssigneesTable, taskTable } from '@/schema/task';

export async function updateTaskDueDate(taskId: string, dueDate: Date) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  try {
    // Get the current task details before updating
    const [currentTask] = await db
      .select()
      .from(taskTable)
      .where(eq(taskTable.id, taskId))
      .limit(1);

    if (!currentTask) {
      return { error: 'Task not found' };
    }

    // Update the task due date
    await db
      .update(taskTable)
      .set({ dueDate })
      .where(eq(taskTable.id, taskId));

    // Get all assignees for the task
    const assignees = await db
      .select({ userId: taskAssigneesTable.userId })
      .from(taskAssigneesTable)
      .where(eq(taskAssigneesTable.taskId, taskId));

    // Create notifications for each assignee
    await Promise.all(
      assignees.map(assignee =>
        createDeadlineUpdateNotification(
          assignee.userId,
          taskId,
          currentTask.title,
          dueDate.toISOString(),
          currentTask.dueDate?.toISOString(),
        ),
      ),
    );

    revalidatePath('/tasks');
    return { success: true };
  } catch (error) {
    console.error('Failed to update task due date:', error);
    return { error: 'Failed to update task due date' };
  }
}
