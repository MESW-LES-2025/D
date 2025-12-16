'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable } from '@/schema/goal';
import { goalAssigneesTable } from '@/schema/goal_assignees';
import { goalTasksTable } from '@/schema/goal_tasks';
import { pointTransactionsTable, userPointsTable } from '@/schema/points';
import { taskAssigneesTable, taskTable } from '@/schema/task';

export async function completeGoal(goalId: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return { error: 'Unauthorized' };
  }

  if (!session.session?.activeOrganizationId) {
    return { error: 'No active organization' };
  }

  try {
    // Fetch the goal
    const [goal] = await db
      .select()
      .from(goalTable)
      .where(eq(goalTable.id, goalId))
      .limit(1);

    if (!goal) {
      return { error: 'Goal not found' };
    }

    if (goal.groupId !== session.session.activeOrganizationId) {
      return { error: 'Unauthorized' };
    }

    // Fetch all tasks in this goal
    const goalTasks = await db
      .select({
        taskId: goalTasksTable.taskId,
        task: taskTable,
      })
      .from(goalTasksTable)
      .innerJoin(taskTable, eq(goalTasksTable.taskId, taskTable.id))
      .where(eq(goalTasksTable.goalId, goalId));

    // Check if all tasks are completed
    const allTasksCompleted = goalTasks.every(gt => gt.task.status === 'done');
    if (!allTasksCompleted) {
      return { error: 'Not all tasks in this goal are completed' };
    }

    // Fetch goal assignees
    const assignees = await db
      .select({
        userId: goalAssigneesTable.userId,
      })
      .from(goalAssigneesTable)
      .where(eq(goalAssigneesTable.goalId, goalId));

    if (assignees.length === 0) {
      return { error: 'Goal has no assignees' };
    }

    const goalAssigneeIds = assignees.map(a => a.userId);

    // Fetch all task assignees to calculate contribution
    const taskAssignments = await db
      .select({
        taskId: taskAssigneesTable.taskId,
        userId: taskAssigneesTable.userId,
      })
      .from(taskAssigneesTable)
      .where(inArray(taskAssigneesTable.taskId, goalTasks.map(gt => gt.taskId)));

    // Calculate points per assignee
    const pointsPerAssignee = new Map<string, number>();

    // Initialize all goal assignees with 0 points
    for (const assigneeId of goalAssigneeIds) {
      pointsPerAssignee.set(assigneeId, 0);
    }

    // Calculate points: for each task, divide points equally among its assignees
    // Only count points for goal assignees
    for (const goalTask of goalTasks) {
      const taskAssigneeIds = taskAssignments
        .filter(ta => ta.taskId === goalTask.taskId)
        .map(ta => ta.userId);

      // Filter to only goal assignees
      const relevantAssignees = taskAssigneeIds.filter(id => goalAssigneeIds.includes(id));

      if (relevantAssignees.length > 0) {
        // Points per assignee for this task
        const pointsPerTaskAssignee = goal.points / relevantAssignees.length;

        for (const assigneeId of relevantAssignees) {
          const current = pointsPerAssignee.get(assigneeId) || 0;
          pointsPerAssignee.set(assigneeId, current + pointsPerTaskAssignee);
        }
      }
    }

    // Update user points and create transactions
    for (const [userId, pointsGained] of pointsPerAssignee.entries()) {
      if (pointsGained === 0) {
        continue;
      }

      // Get or create user points record
      const [userPoints] = await db
        .select()
        .from(userPointsTable)
        .where(
          and(
            eq(userPointsTable.userId, userId),
            eq(userPointsTable.organizationId, session.session.activeOrganizationId),
          ),
        )
        .limit(1);

      const previousTotal = userPoints?.totalPoints || 0;
      const newTotal = previousTotal + pointsGained;

      if (userPoints) {
        // Update existing record
        await db
          .update(userPointsTable)
          .set({ totalPoints: newTotal, updatedAt: new Date() })
          .where(eq(userPointsTable.id, userPoints.id));
      } else {
        // Create new record
        await db.insert(userPointsTable).values({
          userId,
          organizationId: session.session.activeOrganizationId,
          totalPoints: newTotal,
        });
      }

      // Create transaction record
      await db.insert(pointTransactionsTable).values({
        userId,
        organizationId: session.session.activeOrganizationId,
        taskId: null,
        transactionType: 'task_completed',
        pointsChange: pointsGained,
        previousTotal,
        newTotal,
        metadata: JSON.stringify({
          goalId,
          goalName: goal.name,
          type: 'goal_completed',
        }),
      });
    }

    // Mark goal as completed
    const [updated] = await db
      .update(goalTable)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(goalTable.id, goalId))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/goals');

    return {
      success: true,
      data: updated,
      pointsDistributed: pointsPerAssignee,
    };
  } catch (e) {
    console.error('Failed to complete goal:', e);
    return { error: 'Failed to complete goal' };
  }
}
