'use server';

import type { CreateGoalFormData } from '@/validations/GoalValidation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable, goalTasksTable } from '@/schema/goal';

export async function createGoal(data: CreateGoalFormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId || !session?.session?.userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const organizationId = session.session.activeOrganizationId;
    const creatorId = session.session.userId;

    // Create the goal
    const [goal] = await db
      .insert(goalTable)
      .values({
        name: data.name,
        description: data.description,
        points: data.points,
        organizationId,
        creatorId,
        status: 'active',
        dueDate: data.dueDate,
      })
      .returning();

    if (!goal || !goal.id) {
      throw new Error('Failed to create goal or goal ID is missing');
    }

    // Link tasks to the created goal
    const goalTasksValues = data.taskIds.map(taskId => ({
      goalId: goal.id,
      taskId,
    }));

    await db.insert(goalTasksTable).values(goalTasksValues);

    revalidatePath('/dashboard');

    return { success: true, goal };
  } catch (error) {
    console.error('Error creating goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create goal',
    };
  }
}
