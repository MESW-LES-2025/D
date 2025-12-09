'use client';

import { IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteTask } from '@/components/tasks/delete-task.action';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type DeleteTaskButtonProps = {
  taskId: string;
  onDelete?: () => void;
};

export function DeleteTaskButton({ taskId, onDelete }: DeleteTaskButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteTask(taskId);

    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
      return;
    }

    toast.success('Task deleted successfully!');
    setOpen(false);
    onDelete?.();
    setIsDeleting(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconTrash className="ml-auto size-4 cursor-pointer opacity-70 hover:opacity-100" />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Delete task</h4>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this task?
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
