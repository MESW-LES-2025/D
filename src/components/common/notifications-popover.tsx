'use client';

import type { Notification } from '@/lib/notification/notification-types';
import { IconBell, IconBellOff, IconChecks } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { handleNotificationClick } from '@/lib/notification/notification-handlers';
import { notificationTypes } from '@/lib/notification/notification-options';
import { cn, timeAgo } from '@/lib/utils';

type NotificationsPopoverProps = {
  notifications: Notification[];
};

export function NotificationsPopover({ notifications }: NotificationsPopoverProps) {
  const router = useRouter();
  const unreadCount = notifications?.filter(n => !n.read).length ?? 0;

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      router.refresh();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      router.refresh();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleNotificationClickAction = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    const action = handleNotificationClick(notification.type, notification.id, notification.metadata);

    switch (action.type) {
      case 'navigate':
        router.push(action.path);
        break;
      case 'toast':
        if (action.variant === 'success') {
          toast.success(action.message);
        } else if (action.variant === 'destructive') {
          toast.error(action.message);
        } else {
          toast(action.message);
        }
        break;
      case 'custom':
        await action.handler();
        break;
      case 'none':
        break;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <IconBell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2 items-center justify-center rounded-full bg-destructive" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        {!notifications || notifications.length === 0
          ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <IconBellOff className="h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )
          : (
              <ScrollArea className="h-[400px]">
                <div className="flex flex-col">
                  {notifications.map((notification) => {
                    const type = notificationTypes.find(type => type.value === notification.type);
                    return (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() => handleNotificationClickAction(notification)}
                        className={cn(
                          'group flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                          notification.read ? 'opacity-80' : 'bg-muted',
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-background',
                            type?.color,
                          )}
                        >
                          {type?.icon && <type.icon className="size-4.5" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={cn('text-sm leading-none', !notification.read && 'font-medium')}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">{timeAgo(notification.createdAt)}</p>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Mark as read"
                            className="text-muted-foreground transition-opacity hover:opacity-100 focus:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <IconChecks className="size-4" />
                          </Button>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
      </PopoverContent>
    </Popover>
  );
}
