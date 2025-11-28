'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import * as z from 'zod';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskAssigneesTable, taskTable } from '@/schema/task';
import { TaskValidation } from '@/validations/TaskValidation';

export async function createTask(data: z.infer<typeof TaskValidation>) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const parse = TaskValidation.safeParse(data);

  if (!parse.success) {
    return { error: 'Validation failed', details: z.treeifyError(parse.error) };
  }

  const assigneeIds = parse.data.assigneeIds && parse.data.assigneeIds.length > 0
    ? parse.data.assigneeIds
    : [session.user.id];
  const createdById = session.user.id;

  const difficultyMultiplier = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  const baseScore = 10;
  const score = baseScore * difficultyMultiplier[parse.data.difficulty];

  try {
    const [created] = await db
      .insert(taskTable)
      .values({
        title: parse.data.name,
        description: parse.data.description || null,
        priority: parse.data.priority,
        difficulty: parse.data.difficulty,
        status: 'todo',
        score,
        dueDate: parse.data.dueDate ?? null,
        creatorId: createdById,
        organizationId: session.session?.activeOrganizationId ?? null,
      })
      .returning();

    // Add assignees
    if (assigneeIds.length > 0) {
      await db.insert(taskAssigneesTable).values(
        assigneeIds.map(userId => ({
          taskId: created!.id,
          userId,
        })),
      );
    }

    revalidatePath('/dashboard');
    revalidatePath('/tasks');

    return { success: true, data: created };
  } catch (error) {
    console.error('Failed to create task:', error);
    return { error: 'Failed to create task' };
  }
}
