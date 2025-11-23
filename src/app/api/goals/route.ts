import { eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable } from '@/schema/goal';
import { goalTasksTable } from '@/schema/goal_tasks';
import { taskTable } from '@/schema/task';
import { userTable } from '@/schema/user';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.session?.activeOrganizationId) {
    return NextResponse.json({ error: 'No active organization' }, { status: 400 });
  }

  try {
    const goals = await db
      .select({
        id: goalTable.id,
        name: goalTable.name,
        description: goalTable.description,
        points: goalTable.points,
        dueDate: goalTable.dueDate,
        assigneeId: goalTable.assigneeId,
        assigneeName: userTable.name,
        assigneeEmail: userTable.email,
      })
      .from(goalTable)
      .leftJoin(userTable, eq(goalTable.assigneeId, userTable.id))
      .where(eq(goalTable.groupId, session.session.activeOrganizationId));

    const goalIds = goals.map((g: any) => g.id);
    let associations: any[] = [];
    if (goalIds.length > 0) {
      associations = await db
        .select({ goalId: goalTasksTable.goalId, task: taskTable })
        .from(goalTasksTable)
        .innerJoin(taskTable, eq(goalTasksTable.taskId, taskTable.id))
        .where(inArray(goalTasksTable.goalId, goalIds));
    }

    // group by goalId
    const tasksByGoal = new Map<string, any[]>();
    for (const a of associations) {
      const arr = tasksByGoal.get(a.goalId) || [];
      arr.push({ id: a.task.id, name: a.task.tittle });
      tasksByGoal.set(a.goalId, arr);
    }

    const result = goals.map((g: any) => ({ ...g, tasks: tasksByGoal.get(g.id) || [] }));

    return NextResponse.json(result);
  } catch (e) {
    console.error('Failed to fetch goals for api/goals', e);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}
