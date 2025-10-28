'use client';

import { useState } from 'react';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { Button } from '@/components/ui/button';

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  users: User[];
};

export function CreateTaskButton({ users }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Task</Button>
      <CreateTaskModal
        open={open}
        onOpenChange={setOpen}
        users={users}
      />
    </>
  );
}
