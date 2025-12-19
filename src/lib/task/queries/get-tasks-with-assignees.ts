import type { Status, TaskWithAssignees } from '@/lib/task/task-types';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { allStatuses, statuses } from '@/lib/task/task-options';
import { taskAssigneesTable, taskTable } from '@/schema/task';
import { userTable } from '@/schema/user';

export async function getTasksWithAssignees(
  organizationId: string,
  currentUserId: string,
  isAdmin: boolean = false,
): Promise<TaskWithAssignees[]> {
  // Determine which statuses to show based on role
  const statusList = isAdmin
    ? allStatuses.map(s => s.value) as Status[]
    : statuses.map(s => s.value) as Status[];

  // Fetch tasks
  const tasksData = await db
    .select()
    .from(taskTable)
    .where(
      and(
        eq(taskTable.organizationId, organizationId),
        inArray(taskTable.status, statusList),
      ),
    );

  // Early return if no tasks
  if (tasksData.length === 0) {
    return [];
  }

  // Fetch assignees for all tasks
  const taskIds = tasksData.map(t => t.id);
  const assigneesData = await db
    .select({
      taskId: taskAssigneesTable.taskId,
      user: userTable,
    })
    .from(taskAssigneesTable)
    .innerJoin(userTable, eq(taskAssigneesTable.userId, userTable.id))
    .where(inArray(taskAssigneesTable.taskId, taskIds));

  // Group assignees by task ID
  const assigneesByTask = new Map<string, typeof assigneesData>();
  for (const assignment of assigneesData) {
    const existing = assigneesByTask.get(assignment.taskId) || [];
    assigneesByTask.set(assignment.taskId, [...existing, assignment]);
  }

  // Transform tasks to include assignees array
  const tasks: TaskWithAssignees[] = tasksData.map(task => ({
    ...task,
    assignees: (assigneesByTask.get(task.id) || []).map(a => ({
      ...a.user,
      isCurrentUser: a.user.id === currentUserId,
    })),
  }));

  return tasks;
}
