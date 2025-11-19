'use client';

import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateGoalModal } from './CreateGoalModal';

type Props = {
  onCreate: (values: any) => void;
};

export function CreateGoalButton({ onCreate }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <IconPlus className="h-4 w-4" />
        Add Goal
      </Button>
      <CreateGoalModal open={open} onOpenChange={setOpen} onCreate={onCreate} />
    </>
  );
}
