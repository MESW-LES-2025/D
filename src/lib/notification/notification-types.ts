import type { InferSelectModel } from 'drizzle-orm';
import type { notificationTable, notificationTypeEnum } from '@/schema';

export type Notification = InferSelectModel<typeof notificationTable>;

export type NotificationsType = typeof notificationTypeEnum.enumValues[number];
