'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { goalTable } from '@/schema/goal';
import { pointTransactionsTable, userPointsTable } from '@/schema/points';

export async function revertGoalCompletion(goalId: string) {
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

    if (goal.organizationId !== session.session.activeOrganizationId) {
      return { error: 'Unauthorized' };
    }

    if (goal.status !== 'completed') {
      return { error: 'Goal is not completed' };
    }

    // Find all point transactions for this goal completion
    const transactions = await db
      .select()
      .from(pointTransactionsTable)
      .where(
        and(
          eq(pointTransactionsTable.organizationId, session.session.activeOrganizationId),
          eq(pointTransactionsTable.transactionType, 'task_completed'),
        ),
      );

    // Filter to only transactions related to this goal
    const goalTransactions = transactions.filter((t) => {
      try {
        const metadata = JSON.parse(t.metadata || '{}');
        return metadata.goalId === goalId && metadata.type === 'goal_completed';
      } catch {
        return false;
      }
    });

    // Reverse each transaction
    for (const transaction of goalTransactions) {
      const userId = transaction.userId;
      const pointsToReverse = transaction.pointsChange;

      // Get current user points
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

      if (userPoints) {
        const newTotal = userPoints.totalPoints - pointsToReverse;

        // Update user points
        await db
          .update(userPointsTable)
          .set({ totalPoints: newTotal, updatedAt: new Date() })
          .where(eq(userPointsTable.id, userPoints.id));

        // Create reverse transaction record
        await db.insert(pointTransactionsTable).values({
          userId,
          organizationId: session.session.activeOrganizationId,
          taskId: null,
          transactionType: 'task_uncompleted',
          pointsChange: -pointsToReverse,
          previousTotal: userPoints.totalPoints,
          newTotal,
          metadata: JSON.stringify({
            goalId,
            goalName: goal.name,
            type: 'goal_reverted',
            reason: 'task_uncompleted',
          }),
        });
      }
    }

    // Mark goal as reverted to active
    const [updated] = await db
      .update(goalTable)
      .set({
        status: 'active',
        completedAt: null,
      })
      .where(eq(goalTable.id, goalId))
      .returning();

    revalidatePath('/dashboard');
    revalidatePath('/goals');

    return {
      success: true,
      data: updated,
      transactionsReverted: goalTransactions.length,
    };
  } catch (e) {
    console.error('Failed to revert goal completion:', e);
    return { error: 'Failed to revert goal completion' };
  }
}
