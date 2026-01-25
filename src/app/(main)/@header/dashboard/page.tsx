import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateGoalDialog } from '@/components/goals/create-goal-dialog';
import { DynamicHeader } from '@/components/layout/dynamic-header';
import * as userPermissions from '@/components/UserPermissions';
import { auth } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';

async function getDashboardHeaderData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // Redirect if no session
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  // Get user role and permissions
  const currentUserRole = await userPermissions.getUserRole(
    session.user.id,
    session.session.activeOrganizationId,
  );
  const hasPermission = await userPermissions.getUserPermissions(currentUserRole);

  return {
    hasPermission,
    user: session.user,
    activeOrganizationId: session.session.activeOrganizationId,
  };
}

export default async function DashboardHeader() {
  const { hasPermission } = await getDashboardHeaderData();

  return (
    <DynamicHeader
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={(
        <>
          {hasPermission && (
            <CreateGoalDialog />
          )}
        </>
      )}
    />
  );
}
