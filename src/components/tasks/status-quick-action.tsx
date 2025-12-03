'use client';

import type { Status, StatusOption } from '@/lib/task/task-types';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statuses } from '@/lib/task/task-options';
import { updateTaskStatus } from './status-quick-action.actions';

type StatusQuickActionProps = {
  status: StatusOption | undefined;
  taskId: string;
};

export function StatusQuickAction({ status, taskId }: StatusQuickActionProps) {
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
      const result = await updateTaskStatus(taskId, newStatus);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Status updated successfully!');
    });
  };

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
