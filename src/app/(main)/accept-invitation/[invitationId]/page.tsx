import type { Metadata } from 'next';

import { IconBuildingCommunity, IconMail, IconUserPlus, IconUsersPlus } from '@tabler/icons-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/lib/auth/auth';
import AcceptButton from './_components/accept-button';
import DeclineButton from './_components/decline-button';

export const metadata: Metadata = {
  title: 'TaskUp | Invitation',
  description: 'Your invitation to join an organization on TaskUp.',
};

type PageProps = {
  params: Promise<{
    invitationId: string;
  }>;
};

export default async function AcceptInvitationPage({ params }: PageProps) {
  const { invitationId } = await params;

  // Check if user is logged in
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect(`/sign-in?returnTo=/accept-invitation/${invitationId}`);
  }

  // Fetch invitation details
  const invitation = await auth.api.getInvitation({
    query: {
      id: invitationId,
    },
    headers: await headers(),
  });

  return (
    <Empty className="w-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconUsersPlus />
        </EmptyMedia>
        <EmptyTitle>Organization Invitation</EmptyTitle>
        <EmptyDescription>
          You&apos;ve been invited to join an organization
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent>
        <div className="w-full space-y-4 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <IconBuildingCommunity className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1 text-left">
              <p className="text-sm font-medium text-muted-foreground">Organization</p>
              <p className="text-base font-semibold">
                {invitation.organizationName || 'Organization'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-4">
            <IconMail className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1 text-left">
              <p className="text-sm font-medium text-muted-foreground">Invited by</p>
              <p className="text-base">{invitation.inviterEmail}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-4">
            <IconUserPlus className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 space-y-1 text-left">
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <p className="text-base capitalize">{invitation.role}</p>
            </div>
          </div>
        </div>

        <div className="flex w-full gap-3">
          <DeclineButton invitationId={invitationId} />
          <AcceptButton invitationId={invitationId} />
        </div>
      </EmptyContent>
    </Empty>
  );
}
