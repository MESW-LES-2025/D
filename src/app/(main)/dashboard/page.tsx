import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { InviteOrgDialog } from '@/components/dialogs/invite-org-dialog';
import { NoOrganization } from '@/components/empty/no-organization';
import TeamGoals from '@/components/goals/TeamGoals';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth/auth';

export const metadata: Metadata = {
  title: 'TaskUp | Dashboard',
  description: 'Your personal dashboard to manage tasks efficiently.',
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  if (!session.session?.activeOrganizationId) {
    return <NoOrganization />;
  }

  return (
    <div className="py-12">
      <div className="flex max-w-lg flex-col">
        Welcome to the dashboard

        <InviteOrgDialog>
          <Button variant="outline">Invite Member</Button>
        </InviteOrgDialog>
      </div>

      <div className="mt-12">
        <TeamGoals />
      </div>
    </div>
  );
}
