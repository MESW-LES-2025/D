import type { Notification } from '../notification-types';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { notificationTable } from '@/schema';

export async function getUserNotifications(
  userId: string,
): Promise<Notification[]> {
  // Fetch user notifications, for a specific organization
  const notifications = await db
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.userId, userId))
    .orderBy(desc(notificationTable.createdAt))
    .limit(20);

  return notifications;
}
