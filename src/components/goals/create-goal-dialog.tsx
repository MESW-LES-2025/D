'use client';

import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { CreateGoalForm } from '@/components/forms/create-goal-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function CreateGoalDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <IconPlus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[825px]">
        <DialogHeader>
          <DialogTitle>Create Team Goal</DialogTitle>
          <DialogDescription>
            Set a new goal for your team and select tasks to track progress.
          </DialogDescription>
        </DialogHeader>
        <CreateGoalForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
