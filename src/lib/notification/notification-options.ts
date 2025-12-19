import type { Icon } from '@tabler/icons-react';
import type { NotificationsType } from '@/lib/notification/notification-types';
import { IconBell, IconCalendarExclamation } from '@tabler/icons-react';
import { notificationTypeEnum } from '@/schema';

export type NotificationOption = { value: NotificationsType; label: string; icon: Icon; color?: string };

const notificationTypeValues = notificationTypeEnum.enumValues;
type NotificationTypeValue = (typeof notificationTypeValues)[number];

function buildOptions<T extends string, O extends { label: string; icon?: Icon; color?: string }>(
  values: readonly T[],
  configs: Readonly<Record<T, O>>,
  defaultIcon?: Icon,
): { value: T; label: string; icon: Icon; color?: string }[] {
  return values.map((value) => {
    const config = configs[value];
    const label = config?.label ?? (value as unknown as string);
    const icon = (config?.icon ?? defaultIcon) as Icon;

    return { value, label, icon, color: config?.color };
  });
}

const notificationTypeConfig: Record<NotificationTypeValue, { label: string; icon: Icon; color?: string }> = {
  deadline_update: { label: 'Deadline Changed', icon: IconCalendarExclamation, color: 'bg-blue-700' },
  goal: { label: 'Goal Achievement', icon: IconBell, color: 'bg-green-500 dark:bg-green-600' },
};

export const notificationTypes: NotificationOption[] = buildOptions(
  notificationTypeValues,
  notificationTypeConfig,
  IconBell,
);
