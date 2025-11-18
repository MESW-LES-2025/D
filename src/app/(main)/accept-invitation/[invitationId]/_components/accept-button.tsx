'use client';

import { IconCheck, IconLoader2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { client } from '@/lib/auth/auth-client';

type AcceptButtonProps = {
  invitationId: string;
  disabled?: boolean;
};

export default function AcceptButton({ invitationId, disabled }: AcceptButtonProps) {
  const router = useRouter();
  const [isAccepting, startAccepting] = useTransition();

  const handleAccept = () => {
    startAccepting(async () => {
      try {
        const { data, error } = await client.organization.acceptInvitation({
          invitationId,
        });

        if (error) {
          toast.error(error.message || 'Failed to accept invitation');
          return;
        }

        if (data) {
          toast.success('Successfully joined the organization!');
          router.push('/dashboard');
          router.refresh();
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
      }
    });
  };

  return (
    <Button onClick={handleAccept} disabled={isAccepting || disabled} className="flex-1">
      {isAccepting
        ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Accepting...
            </>
          )
        : (
            <>
              <IconCheck className="mr-2 h-4 w-4" />
              Accept Invitation
            </>
          )}
    </Button>
  );
}
