import type { NotificationMetadata } from './notification-handlers';
import type { NotificationsType } from './notification-types';
import { db } from '@/lib/db';
import { notificationTable } from '@/schema';

export async function createNotification<T extends NotificationsType>(
  userId: string,
  type: T,
  message: string,
  metadata?: NotificationMetadata[T],
) {
  const [notification] = await db
    .insert(notificationTable)
    .values({
      userId,
      type,
      message,
      metadata: metadata ? (metadata as unknown as Record<string, unknown>) : null,
    })
    .returning();

  return notification;
}

export async function createDeadlineUpdateNotification(
  userId: string,
  taskId: string,
  taskTitle: string,
  newDeadline: string,
  oldDeadline?: string,
) {
  const message = oldDeadline
    ? `Task "${taskTitle}" deadline updated to ${new Date(newDeadline).toLocaleDateString()}`
    : `Task "${taskTitle}" deadline set to ${new Date(newDeadline).toLocaleDateString()}`;

  return createNotification(userId, 'deadline_update', message, {
    taskId,
    taskTitle,
    newDeadline,
    oldDeadline,
  });
}

export async function createGoalAchievementNotification(
  userId: string,
  goalId: string,
  goalTitle: string,
  achievedDate: string,
) {
  const message = `Congratulations! Goal "${goalTitle}" has been achieved!`;

  return createNotification(userId, 'goal', message, {
    goalId,
    goalTitle,
    achievedDate,
  });
}
