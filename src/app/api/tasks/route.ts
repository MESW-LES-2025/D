import { eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskTable, taskAssigneesTable } from '@/schema/task';
import { userTable } from '@/schema/user';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await db
      .select({
        id: taskTable.id,
        name: taskTable.title,
      })
      .from(taskTable)
      .where(eq(taskTable.organizationId, session.session?.activeOrganizationId ?? ''));

    // Get assignees for all tasks
    const taskIds = tasks.map(t => t.id);
    let taskAssignees: any[] = [];
    if (taskIds.length > 0) {
      taskAssignees = await db
        .select({
          taskId: taskAssigneesTable.taskId,
          userId: taskAssigneesTable.userId,
          userName: userTable.name,
        })
        .from(taskAssigneesTable)
        .innerJoin(userTable, eq(taskAssigneesTable.userId, userTable.id))
        .where(inArray(taskAssigneesTable.taskId, taskIds));
    }

    // Map assignees to tasks
    const assigneesByTaskId = new Map<string, Array<{ id: string; name: string }>>();
    for (const ta of taskAssignees) {
      const arr = assigneesByTaskId.get(ta.taskId) || [];
      arr.push({ id: ta.userId, name: ta.userName });
      assigneesByTaskId.set(ta.taskId, arr);
    }

    const tasksWithAssignees = tasks.map(t => ({
      ...t,
      assignees: assigneesByTaskId.get(t.id) || [],
    }));

    return NextResponse.json(tasksWithAssignees);
  } catch (e) {
    console.error('Failed to fetch tasks for api/tasks', e);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
