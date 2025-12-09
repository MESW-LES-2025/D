'use client';

import { IconChevronDown } from '@tabler/icons-react';
import { useOptimistic, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateTaskDueDate } from '@/components/tasks/due-date-quick-action.action';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DueDateQuickActionProps = {
  dueDate: Date | null | undefined;
  taskId: string;
};

export function DueDateQuickAction({ dueDate, taskId }: DueDateQuickActionProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticDueDate, setOptimisticDueDate] = useOptimistic(
    dueDate ?? null,
    (_state, newDueDate: Date | null) => newDueDate,
  );

  const handleDueDateChange = (newDueDate: Date | undefined) => {
    if (!newDueDate) {
      return;
    }

    startTransition(async () => {
      setOptimisticDueDate(newDueDate);
      const result = await updateTaskDueDate(taskId, newDueDate);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Due date updated successfully!');
      setOpen(false);
    });
  };

  const currentDueDate = optimisticDueDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'group h-auto border-none p-0 font-normal hover:cursor-pointer hover:bg-transparent!',
            !currentDueDate && 'text-muted-foreground',
          )}
          disabled={isPending}
        >
          <span className="inline-flex items-center gap-1">
            {currentDueDate
              ? (
                  currentDueDate.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                )
              : (
                  <span>No due date</span>
                )}
            <IconChevronDown className="size-4 opacity-0 transition-opacity group-hover:opacity-50 group-focus-visible:opacity-100" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={currentDueDate ?? undefined}
          captionLayout="dropdown"
          onSelect={handleDueDateChange}
          disabled={isPending}
        />
      </PopoverContent>
    </Popover>
  );
}
