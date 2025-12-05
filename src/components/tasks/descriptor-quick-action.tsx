'use client';

import { IconCheck, IconPencil, IconX } from '@tabler/icons-react';
import { useOptimistic, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { updateTaskDescriptor } from '@/components/tasks/descriptor-quick-action.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

type DescriptorQuickActionProps = {
  title: string;
  description: string | null;
  taskId: string;
};

export function DescriptorQuickAction({ title, description, taskId }: DescriptorQuickActionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description ?? '');
  const [isPending, startTransition] = useTransition();

  const [optimisticTitle, setOptimisticTitle] = useOptimistic(
    title ?? '',
    (_state, newTitle: string) => newTitle,
  );

  const [optimisticDescription, setOptimisticDescription] = useOptimistic(
    description ?? '',
    (_state, newDescription: string) => newDescription,
  );

  if (!title) {
    return null;
  }

  const handleSave = () => {
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    startTransition(async () => {
      setOptimisticTitle(editTitle);
      setOptimisticDescription(editDescription);

      const result = await updateTaskDescriptor(taskId, editTitle, editDescription);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Task updated successfully!');
      setIsEditing(false);
    });
  };

  const handleCancel = () => {
    setEditTitle(optimisticTitle);
    setEditDescription(optimisticDescription ?? '');
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditTitle(optimisticTitle);
    setEditDescription(optimisticDescription ?? '');
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Task title"
            className="w-full text-xl font-semibold"
            disabled={isPending}
          />
        </div>
        <Textarea
          value={editDescription}
          onChange={e => setEditDescription(e.target.value)}
          placeholder="Add a description..."
          className="min-h-[100px] resize-none"
          disabled={isPending}
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending}
          >
            <IconCheck className="size-4" />
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isPending}
          >
            <IconX className="size-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative space-y-2">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 size-6 cursor-pointer opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100"
        onClick={handleEdit}
      >
        <IconPencil className="size-4" />
      </Button>
      <SheetTitle className="text-xl">{optimisticTitle}</SheetTitle>
      <SheetDescription>
        {optimisticDescription || 'No description'}
      </SheetDescription>
    </div>
  );
}
