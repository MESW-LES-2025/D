'use server';

import type { PointTransactionType } from '@/lib/task/task-types';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  pointTransactionsTable,
  taskAssigneesTable,
  userPointsTable,
} from '@/schema';

/**
 * Get or create user points record for a user in an organization
 */
async function getOrCreateUserPoints(userId: string, organizationId: string) {
  const [existing] = await db
    .select()
    .from(userPointsTable)
    .where(
      and(
        eq(userPointsTable.userId, userId),
        eq(userPointsTable.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (existing) {
    return existing;
  }

  // Create new record with 0 points
  const [newRecord] = await db
    .insert(userPointsTable)
    .values({
      userId,
      organizationId,
      totalPoints: 0,
    })
    .returning();

  return newRecord;
}

/**
 * Record a point transaction and update user's total points
 */
async function recordPointTransaction(
  userId: string,
  organizationId: string,
  taskId: string | null,
  transactionType: PointTransactionType,
  pointsChange: number,
  metadata: object,
) {
  // Get current user points
  const userPoints = await getOrCreateUserPoints(userId, organizationId);

  if (!userPoints) {
    throw new Error(`Failed to get or create user points for user ${userId}`);
  }

  const previousTotal = userPoints.totalPoints;
  const newTotal = previousTotal + pointsChange;

  // Record transaction
  await db.insert(pointTransactionsTable).values({
    userId,
    organizationId,
    taskId,
    transactionType,
    pointsChange,
    previousTotal,
    newTotal,
    metadata: JSON.stringify(metadata),
  });

  // Update user's total points
  await db
    .update(userPointsTable)
    .set({
      totalPoints: newTotal,
      updatedAt: new Date(),
    })
    .where(eq(userPointsTable.id, userPoints.id));

  return { previousTotal, newTotal, pointsChange };
}

/**
 * Award points to all assignees of a task
 */
export async function awardPointsToAssignees(
  taskId: string,
  organizationId: string,
  totalPoints: number,
  transactionType: PointTransactionType,
  metadata: object,
): Promise<void> {
  // Get all assignees for this task
  const assignees = await db
    .select({
      userId: taskAssigneesTable.userId,
    })
    .from(taskAssigneesTable)
    .where(eq(taskAssigneesTable.taskId, taskId));

  if (assignees.length === 0) {
    console.warn(`No assignees found for task ${taskId}, no points awarded`);
    return;
  }

  // Calculate points per assignee (totalPoints is already the total)
  const pointsPerAssignee = Math.round(totalPoints / assignees.length);

  // Award points to each assignee
  for (const assignee of assignees) {
    await recordPointTransaction(
      assignee.userId,
      organizationId,
      taskId,
      transactionType,
      pointsPerAssignee,
      {
        ...metadata,
        totalPoints,
        pointsPerAssignee,
        assigneeCount: assignees.length,
      },
    );
  }
}

/**
 * Deduct points from all assignees of a task
 */
export async function deductPointsFromAssignees(
  taskId: string,
  organizationId: string,
  totalPoints: number,
  transactionType: PointTransactionType,
  metadata: object,
): Promise<void> {
  // Get all assignees for this task
  const assignees = await db
    .select({
      userId: taskAssigneesTable.userId,
    })
    .from(taskAssigneesTable)
    .where(eq(taskAssigneesTable.taskId, taskId));

  if (assignees.length === 0) {
    console.warn(`No assignees found for task ${taskId}, no points deducted`);
    return;
  }

  // Calculate points per assignee (totalPoints is already the total)
  const pointsPerAssignee = Math.round(totalPoints / assignees.length);

  // Deduct points from each assignee
  for (const assignee of assignees) {
    await recordPointTransaction(
      assignee.userId,
      organizationId,
      taskId,
      transactionType,
      -pointsPerAssignee, // Negative for deduction
      {
        ...metadata,
        totalPoints,
        pointsPerAssignee,
        assigneeCount: assignees.length,
      },
    );
  }
}

/**
 * Adjust points when task properties change (recalculate and apply delta)
 * This is used when priority, difficulty, or due date changes on a done task
 * Note: oldPoints and newPoints are TOTAL points (not per-assignee)
 */
export async function adjustPointsForPropertyChange(
  taskId: string,
  organizationId: string,
  oldTotalPoints: number,
  newTotalPoints: number,
  transactionType: PointTransactionType,
  metadata: object,
): Promise<void> {
  // Get all assignees for this task
  const assignees = await db
    .select({
      userId: taskAssigneesTable.userId,
    })
    .from(taskAssigneesTable)
    .where(eq(taskAssigneesTable.taskId, taskId));

  if (assignees.length === 0) {
    console.warn(`No assignees found for task ${taskId}, no points adjusted`);
    return;
  }

  // Calculate delta per assignee
  const oldPointsPerAssignee = Math.round(oldTotalPoints / assignees.length);
  const newPointsPerAssignee = Math.round(newTotalPoints / assignees.length);
  const deltaPerAssignee = newPointsPerAssignee - oldPointsPerAssignee;

  if (deltaPerAssignee === 0) {
    return; // No change needed
  }

  // Apply delta to each assignee
  for (const assignee of assignees) {
    await recordPointTransaction(
      assignee.userId,
      organizationId,
      taskId,
      transactionType,
      deltaPerAssignee,
      {
        ...metadata,
        oldTotalPoints,
        newTotalPoints,
        assigneeCount: assignees.length,
        oldPointsPerAssignee,
        newPointsPerAssignee,
        deltaPerAssignee,
      },
    );
  }
}
