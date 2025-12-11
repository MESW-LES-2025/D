'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable } from '@/schema/goal';
import { goalTasksTable } from '@/schema/goal_tasks';
import { goalAssigneesTable } from '@/schema/goal_assignees';

export async function createGoal(data: {
  title: string;
  description?: string;
  pointsReward?: string;
  dueDate?: string;
  assigneeIds?: string[];
  taskIds?: string[];
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  if (!session.session?.activeOrganizationId) {
    return { error: 'No active organization' };
  }

  try {
    const points = data.pointsReward ? Number.parseInt(data.pointsReward, 10) : 0;

    const values: any = {
      name: data.title,
      groupId: session.session.activeOrganizationId,
      createdById: session.user.id,
    };

    if (data.description) {
      values.description = data.description;
    }
    if (points > 0) {
      values.points = points;
    }
    if (data.dueDate) {
      values.dueDate = new Date(data.dueDate);
    } else {
      values.dueDate = null;
    }

    const [created] = await db
      .insert(goalTable)
      .values(values)
      .returning();

    // persist assignees
    if (created && created.id && data.assigneeIds && Array.isArray(data.assigneeIds) && data.assigneeIds.length > 0) {
      const assigneeRows = data.assigneeIds.map((userId: string) => ({
        goalId: created.id,
        userId,
      }));
      try {
        await db.insert(goalAssigneesTable).values(assigneeRows);
      } catch (e) {
        console.error('Failed to save goal-assignee associations', e);
      }
    }

    // persist task associations
    if (created && created.id && data.taskIds && Array.isArray(data.taskIds) && data.taskIds.length > 0) {
      const rows = data.taskIds.map((tid: string) => ({ goalId: created.id, taskId: tid }));
      try {
        await db.insert(goalTasksTable).values(rows);
      } catch (e) {
        console.error('Failed to save goal-task associations', e);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/goals');

    return { success: true, data: created };
  } catch (e) {
    console.error('Failed to create goal:', e);
    return { error: 'Failed to create goal' };
  }
}
