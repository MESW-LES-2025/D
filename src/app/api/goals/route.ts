import { eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable } from '@/schema/goal';
import { goalTasksTable } from '@/schema/goal_tasks';
import { taskTable } from '@/schema/task';
import { taskAssigneesTable } from '@/schema/task';
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
    const currentUserId = session.user?.id;

    let associations: any[] = [];
    if (goalIds.length > 0) {
      associations = await db
        .select({
          goalId: goalTasksTable.goalId,
          task: taskTable,
        })
        .from(goalTasksTable)
        .innerJoin(taskTable, eq(goalTasksTable.taskId, taskTable.id))
        .where(inArray(goalTasksTable.goalId, goalIds));
    }

    // Get assignees for all tasks to determine personal vs team completions
    let taskAssignees: any[] = [];
    const taskIds = associations.map(a => a.task.id);
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

    // Create maps for task ID to assignee info and user IDs
    const taskAssigneeMap = new Map<string, string[]>();
    const taskAssigneeInfoMap = new Map<string, Array<{ id: string; name: string }>>();
    for (const ta of taskAssignees) {
      const idArr = taskAssigneeMap.get(ta.taskId) || [];
      idArr.push(ta.userId);
      taskAssigneeMap.set(ta.taskId, idArr);

      const infoArr = taskAssigneeInfoMap.get(ta.taskId) || [];
      infoArr.push({ id: ta.userId, name: ta.userName });
      taskAssigneeInfoMap.set(ta.taskId, infoArr);
    }

    // group by goalId
    const tasksByGoal = new Map<string, any[]>();
    const completedTeamTasksByGoal = new Map<string, number>();
    const completedPersonalTasksByGoal = new Map<string, number>();

    for (const a of associations) {
      const arr = tasksByGoal.get(a.goalId) || [];
      const isCompleted = a.task.status === 'done';
      const assigneeIds = taskAssigneeMap.get(a.task.id) || [];
      const assigneeInfo = taskAssigneeInfoMap.get(a.task.id) || [];
      const isPersonalTask = currentUserId && assigneeIds.includes(currentUserId);

      arr.push({
        id: a.task.id,
        name: a.task.title,
        completed: isCompleted,
        isPersonal: isPersonalTask,
        assignees: assigneeInfo,
      });
      tasksByGoal.set(a.goalId, arr);

      // Track completion stats
      if (isCompleted) {
        const teamCount = completedTeamTasksByGoal.get(a.goalId) || 0;
        completedTeamTasksByGoal.set(a.goalId, teamCount + 1);

        if (isPersonalTask) {
          const personalCount = completedPersonalTasksByGoal.get(a.goalId) || 0;
          completedPersonalTasksByGoal.set(a.goalId, personalCount + 1);
        }
      }
    }

    const result = goals.map((g: any) => {
      const tasks = tasksByGoal.get(g.id) || [];
      return {
        ...g,
        tasks,
        totalTasks: tasks.length,
        completedTeamTasks: completedTeamTasksByGoal.get(g.id) || 0,
        completedPersonalTasks: completedPersonalTasksByGoal.get(g.id) || 0,
      };
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error('Failed to fetch goals for api/goals', e);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}
