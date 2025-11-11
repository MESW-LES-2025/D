'use client';

import { useState } from 'react';
import { CreateOrgForm } from '@/components/forms/create-org-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type CreateOrgDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
};

export function CreateOrgDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: CreateOrgDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button>Create Organization</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new organization.
          </DialogDescription>
        </DialogHeader>
        <CreateOrgForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
