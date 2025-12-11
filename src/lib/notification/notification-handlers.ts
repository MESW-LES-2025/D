import type { NotificationsType } from './notification-types';

export type NotificationMetadata = {
  deadline_update: {
    taskId: string;
    taskTitle: string;
    oldDeadline?: string;
    newDeadline: string;
  };
  goal: {
    goalId: string;
    goalTitle: string;
    achievedDate: string;
  };
};

export type NotificationAction
  = | { type: 'navigate'; path: string }
    | { type: 'toast'; message: string; variant?: 'default' | 'destructive' | 'success' }
    | { type: 'custom'; handler: () => void | Promise<void> }
    | { type: 'none' };

export type NotificationHandler<T extends NotificationsType> = (
  notificationId: string,
  metadata: NotificationMetadata[T] | null,
) => NotificationAction;

export const notificationHandlers: Record<NotificationsType, NotificationHandler<NotificationsType>> = {
  deadline_update: (_notificationId, metadata) => {
    if (metadata && 'taskId' in metadata) {
      return { type: 'navigate', path: `/tasks?taskId=${metadata.taskId}` };
    }

    return { type: 'navigate', path: '/tasks' };
  },

  goal: (_notificationId) => {
    return { type: 'none' }; // For now is not doing anything, but this should be discussed further
  },
};

export function getNotificationHandler(type: NotificationsType): NotificationHandler<NotificationsType> {
  return notificationHandlers[type];
}

export function handleNotificationClick(
  type: NotificationsType,
  notificationId: string,
  metadata: unknown,
): NotificationAction {
  const handler = getNotificationHandler(type);
  return handler(notificationId, metadata as NotificationMetadata[typeof type] | null);
}
