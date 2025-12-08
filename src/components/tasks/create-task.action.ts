'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { z } from 'zod';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskAssigneesTable, taskTable } from '@/schema';
import { TaskValidation } from '@/validations/TaskValidation';

type CreateTaskInput = z.infer<typeof TaskValidation>;

export async function createTask(input: CreateTaskInput, organizationId: string) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    // Validate input
    const validatedData = TaskValidation.parse(input);

    // Calculate score based on difficulty (Needs to be fixed to better score calculation)
    const scoreMap = {
      easy: 10,
      medium: 20,
      hard: 30,
    } as const;
    const score = scoreMap[validatedData.difficulty];

    // Create the task
    const [task] = await db
      .insert(taskTable)
      .values({
        title: validatedData.title,
        description: validatedData.description || null,
        status: validatedData.status,
        priority: validatedData.priority,
        difficulty: validatedData.difficulty,
        dueDate: validatedData.dueDate || null,
        score,
        creatorId: session.user.id,
        organizationId: organizationId || null,
      })
      .returning();

    if (!task) {
      return { error: 'Failed to create task' };
    }

    // Assign users to the task
    if (validatedData.assigneeIds && validatedData.assigneeIds.length > 0) {
      await db.insert(taskAssigneesTable).values(
        validatedData.assigneeIds.map(userId => ({
          taskId: task.id,
          userId,
        })),
      );
    }

    // Revalidate the tasks page
    revalidatePath('/tasks');

    return { success: true, task };
  } catch (error) {
    console.error('Error creating task:', error);

    if (error instanceof z.ZodError) {
      return { error: 'Invalid task data' };
    }

    return { error: 'Failed to create task' };
  }
}
