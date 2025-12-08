'use client';

import type { Row } from '@tanstack/react-table';
import type { Task } from '@/lib/task/task-types';
import { IconDots } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { archiveTask } from '@/components/tasks/archive-task.action';
import { deleteTask } from '@/components/tasks/delete-task.action';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DataTableRowActionsProps<TData> = {
  row: Row<TData>;
};

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState(false);

  const handleArchive = useCallback(async () => {
    const task = row.original as Task;
    const result = await archiveTask(task.id);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Task archived successfully!');
    setOpen(false);
  }, [row]);

  const handleDelete = useCallback(async () => {
    const task = row.original as Task;
    const result = await deleteTask(task.id);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success('Task deleted successfully!');
    setOpen(false);
  }, [row]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+Backspace (Mac) or Ctrl+Backspace (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'Backspace') {
        event.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, handleDelete]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={e => e.stopPropagation()}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 data-[state=open]:bg-muted"
          >
            <IconDots />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleArchive()}>
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => handleDelete()}>
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
