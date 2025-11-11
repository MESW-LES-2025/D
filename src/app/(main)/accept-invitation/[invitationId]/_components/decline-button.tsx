'use client';

import { IconLoader2, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { client } from '@/lib/auth/auth-client';

type DeclineButtonProps = {
  invitationId: string;
  disabled?: boolean;
};

export default function DeclineButton({ invitationId, disabled }: DeclineButtonProps) {
  const router = useRouter();
  const [isDeclining, startDeclining] = useTransition();

  const handleDecline = () => {
    startDeclining(async () => {
      try {
        const { data, error } = await client.organization.rejectInvitation({
          invitationId,
        });

        if (error) {
          toast.error(error.message || 'Failed to decline invitation');
          return;
        }

        if (data) {
          toast.success('Invitation declined');
          router.push('/dashboard');
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
      }
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleDecline}
      disabled={isDeclining || disabled}
      className="flex-1"
    >
      {isDeclining
        ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Declining...
            </>
          )
        : (
            <>
              <IconX className="mr-2 h-4 w-4" />
              Decline
            </>
          )}
    </Button>
  );
}
