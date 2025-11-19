'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import { EditRoleForm } from '@/components/forms/edit-member-role-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type EditRoleProps = {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  username?: string;
  role?: string;
  memberId?: string;
};

export function EditMemberDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
  username,
  role,
  memberId,
}: EditRoleProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && children && (
        <DialogTrigger asChild>{children}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {`Edit ${username}'s Role`}
          </DialogTitle>
        </DialogHeader>
        <EditRoleForm userRole={role} memberId={memberId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
