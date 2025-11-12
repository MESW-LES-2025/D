'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import * as z from 'zod';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';
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

  const assigneeId = parse.data.assigneeId ?? session.user.id;
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
        userId: assigneeId,
        assigneeId,
        createdById,
        groupId: parse.data.groupId,
        name: parse.data.name,
        description: parse.data.description || null,
        priority: parse.data.priority,
        difficulty: parse.data.difficulty,
        status: 'todo',
        score,
        dueDate: parse.data.dueDate ?? null,
      })
      .returning();

    revalidatePath('/dashboard');

    return { success: true, data: created };
  } catch {
    return { error: 'Failed to create task' };
  }
}
