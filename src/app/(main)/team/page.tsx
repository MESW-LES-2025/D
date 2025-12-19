import type { User } from 'better-auth';
import type { Metadata } from 'next';
// import { organization } from 'better-auth/plugins/organization';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { InviteOrgDialog } from '@/components/dialogs/invite-org-dialog';
import { RoleFilter } from '@/components/team/role-filter-search';
import { Button } from '@/components/ui/button';
import * as userPermissions from '@/components/UserPermissions';
import { auth } from '@/lib/auth/auth';
// import { Result } from 'postcss';
// import { organization } from '@/lib/auth/auth-client';
import { db } from '@/lib/db';
// import { getUserRole } from '@/lib/utils';
import * as organizationSchema from '@/schema/organization';
import { userTable } from '@/schema/user';

export const metadata: Metadata = {
  title: 'TaskUp | Team',
  description: 'View all team members in your organization.',
};

async function getActiveOrganization(organizationId: undefined | null | string) {
  if (!organizationId) {
    return null;
  }
  try {
    // Query the organization table to get the organization name
    const organizations = await db.select()
      .from(organizationSchema.organizationTable)
      .where(eq(organizationSchema.organizationTable.id, organizationId));
    return organizations[0] || null;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

type OrganizationUser = {
  id: string;
  memberId: string;
  name: string;
  role: string;
  email: string;
  image: string | null;
  createdAt: Date;
};

async function getUsersInOrganization(organizationId: string | null | undefined): Promise<OrganizationUser[]> {
  if (!organizationId) {
    return [];
  }
  try {
    // Get users who are members of the current organization
    const organizationUsers = await db.select({
      id: userTable.id,
      memberId: organizationSchema.memberTable.id,
      name: userTable.name,
      role: organizationSchema.memberTable.role,
      email: userTable.email,
      image: userTable.image,
      createdAt: userTable.createdAt,
    })
      .from(organizationSchema.memberTable)
      .innerJoin(userTable, eq(organizationSchema.memberTable.userId, userTable.id))
      .where(eq(organizationSchema.memberTable.organizationId, organizationId));

    return organizationUsers;
  } catch (error) {
    console.error('Error fetching organization users:', error);
    return [];
  }
}

export default async function TeamPage() {
  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/sign-in');
  }

  const currentUser: User = session.user;
  const activeOrganization = await getActiveOrganization(session.session.activeOrganizationId);
  const users = await getUsersInOrganization(session.session.activeOrganizationId);

  const currentUserRole = await userPermissions.getUserRole(currentUser.id, session.session.activeOrganizationId);
  const hasPermission = await userPermissions.getUserPermissions(currentUserRole);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <div className="flex items-start justify-between">
            <h1 className="mb-8 text-center text-3xl font-bold">
              All Team Members in
              {activeOrganization ? ` ${activeOrganization.name}` : ' Your Organization'}
            </h1>
            <InviteOrgDialog>
              <Button>Invite Member</Button>
            </InviteOrgDialog>
          </div>
          <div className="space-y-4">
            <RoleFilter users={users} currentUser={currentUser} hasPermissions={hasPermission} />
          </div>
        </div>
      </div>
    </div>
  );
}
