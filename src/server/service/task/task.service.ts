import type { ZodError } from 'zod';
import type { TaskDashboard } from '@/types/task';
import { asc, eq, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';
import { userTable } from '@/schema/user';
import { TaskValidation } from '@/validations/TaskValidation';

// TODO - Use this until the "Group menu" is implemented. After that deleted this method and get the tasks filtering with group_id
export async function getAllTasks(): Promise<TaskDashboard[]> {
  const tasks = await db
    .select({
      id: taskTable.id,
      name: taskTable.name,
      status: taskTable.status,
      dueDate: taskTable.dueDate,
      userId: userTable?.id,
      userName: userTable?.name,
    })
    .from(taskTable)
    .leftJoin(userTable, eq(taskTable.userId, userTable.id))
    .where(isNull(taskTable.removedAt))
    .orderBy(asc(taskTable.dueDate));

  return tasks;
};

export async function updateTask(id: any, taskBody: any) {
  const validation = TaskValidation.safeParse({ ...taskBody, id });

  if (!validation.success) {
    const zodError = validation.error as ZodError;
    const errors = zodError.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      errors,
    };
  }

  // TODO - Add validation if the logged user can change the task status
  // TODO - Add validation to check witch fild could be updated
  const updatedFields = {
    ...taskBody,
  };
  const [updatedTask] = await db
    .update(taskTable)
    .set(updatedFields)
    .where(eq(taskTable.id, id))
    .returning();

  if (!updatedTask) {
    notFound();
  }

  return {
    success: true,
  };
};
