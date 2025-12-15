'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable, goalTasksTable } from '@/schema/goal';

export async function updateGoal(
  goalId: string,
  data: {
    title: string;
    description?: string;
    pointsReward?: string;
    dueDate?: string;
    assigneeIds?: string[];
    taskIds?: string[];
  },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  if (!session.session?.activeOrganizationId) {
    return { error: 'No active organization' };
  }

  try {
    const points = data.pointsReward ? Number.parseInt(data.pointsReward, 10) : 0;

    const updates: any = {
      name: data.title,
    };

    if (data.description) {
      updates.description = data.description;
    }
    if (points > 0) {
      updates.points = points;
    }
    if (data.dueDate) {
      updates.dueDate = new Date(data.dueDate);
    }
    if (data.assigneeIds && data.assigneeIds.length > 0) {
      updates.assigneeId = data.assigneeIds[0];
    }

    const [updated] = await db
      .update(goalTable)
      .set(updates)
      .where(eq(goalTable.id, goalId))
      .returning();

    // Update task associations - delete old ones and insert new ones
    if (data.taskIds && Array.isArray(data.taskIds)) {
      // Delete all existing associations for this goal
      await db.delete(goalTasksTable).where(eq(goalTasksTable.goalId, goalId));

      // Insert new associations
      if (data.taskIds.length > 0) {
        const rows = data.taskIds.map((tid: string) => ({ goalId, taskId: tid }));
        await db.insert(goalTasksTable).values(rows);
      }
    }

    revalidatePath('/dashboard');

    return { success: true, data: updated };
  } catch (e) {
    console.error('Failed to update goal:', e);
    return { error: 'Failed to update goal' };
  }
}
