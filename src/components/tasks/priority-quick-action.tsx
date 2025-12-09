'use client';

import type { Priority, PriorityOption } from '@/lib/task/task-types';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';
import { updateTaskPriority } from '@/components/tasks/priority-quick-action.action';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { priorities } from '@/lib/task/task-options';

type PriorityQuickActionProps = {
  priority: PriorityOption | undefined;
  taskId: string;
};

export function PriorityQuickAction({ priority, taskId }: PriorityQuickActionProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPriority, setOptimisticPriority] = useOptimistic(
    priority?.value ?? '',
    (_state, newPriority: Priority) => newPriority,
  );

  if (!priority) {
    return null;
  }

  const handlePriorityChange = (newPriority: Priority) => {
    startTransition(async () => {
      setOptimisticPriority(newPriority);
      const result = await updateTaskPriority(taskId, newPriority);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Priority updated successfully!');
    });
  };

  const currentPriority = priorities.find(p => p.value === optimisticPriority) ?? priority;

  return (
    <Select value={optimisticPriority} onValueChange={handlePriorityChange} disabled={isPending}>
      <SelectTrigger
        className="h-auto! border-none p-0 hover:cursor-pointer dark:bg-transparent hover:dark:bg-transparent"
        chevronClassName="opacity-0 group-hover:opacity-50 group-focus-visible:opacity-100 transition-opacity"
      >
        <SelectValue>
          <span className="inline-flex items-center gap-1">
            {currentPriority.icon && <currentPriority.icon className="size-4" />}
            <span>{currentPriority.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {priorities.map(priorityOption => (
            <SelectItem key={priorityOption.value} value={priorityOption.value}>
              <span className="inline-flex items-center gap-1">
                {priorityOption.icon && <priorityOption.icon className="size-4" />}
                <span>{priorityOption.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
