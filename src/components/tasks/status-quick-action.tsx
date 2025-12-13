'use client';

import type { Status, StatusOption } from '@/lib/task/task-types';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';
import { updateTaskStatus } from '@/components/tasks/status-quick-action.action';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { allStatuses, statuses as statusesWithoutHidden } from '@/lib/task/task-options';

type StatusQuickActionProps = {
  status: StatusOption | undefined;
  taskId: string;
  showHidden?: boolean;
};

export function StatusQuickAction({ status, taskId, showHidden = false }: StatusQuickActionProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    status?.value ?? '',
    (_state, newStatus: Status) => newStatus,
  );

  if (!status) {
    return null;
  }

  const handleStatusChange = (newStatus: Status) => {
    startTransition(async () => {
      setOptimisticStatus(newStatus);

      // Get the previously unlocked achievements before the status change
      const previouslyUnlockedStr = localStorage.getItem('unlockedAchievements');
      const previouslyUnlocked = previouslyUnlockedStr ? JSON.parse(previouslyUnlockedStr) : [];

      const result = await updateTaskStatus(taskId, newStatus);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (newStatus === 'done') {
        const completionMessages = [
          'Task complete! Well done!',
          'Complete! Good job!',
          'Done! Great work!',
        ];
        const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
        const pointsText = result.score ? ` +${result.score} points` : '';
        toast.success(`${randomMessage}${pointsText}`);
      } else {
        toast.success('Status updated successfully!');
      }

      // Show achievement toasts only for newly unlocked achievements
      if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
        // Find achievements that weren't unlocked before
        result.newlyUnlocked.forEach((achievement) => {
          if (!previouslyUnlocked.includes(achievement.id)) {
            toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
              duration: 5000,
            });
          }
        });

        // Update localStorage with currently unlocked achievement IDs
        const currentlyUnlockedIds = result.newlyUnlocked.map(a => a.id);
        localStorage.setItem('unlockedAchievements', JSON.stringify(currentlyUnlockedIds));
      }
    });
  };

  const statuses = showHidden ? allStatuses : statusesWithoutHidden;
  const currentStatus = statuses.find(s => s.value === optimisticStatus) ?? status;

  return (
    <Select value={optimisticStatus} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger
        className="h-auto! border-none p-0 hover:cursor-pointer dark:bg-transparent hover:dark:bg-transparent"
        chevronClassName="opacity-0 group-hover:opacity-50 group-focus-visible:opacity-100 transition-opacity"
      >
        <SelectValue>
          <span className="inline-flex items-center gap-1">
            {currentStatus.icon && <currentStatus.icon className="size-4" />}
            <span>{currentStatus.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {statuses.map(statusOption => (
            <SelectItem key={statusOption.value} value={statusOption.value}>
              <span className="inline-flex items-center gap-1">
                {statusOption.icon && <statusOption.icon className="size-4" />}
                <span>{statusOption.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
