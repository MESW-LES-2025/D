import { and, eq } from 'drizzle-orm';
// import { auth } from '@/lib/auth/auth';
import { organization } from '@/lib/auth/auth-client';
// import { ac } from '@/lib/auth/permissions';
// import { organization } from 'better-auth/plugins';
import { db } from '@/lib/db';
import * as organizationSchema from '@/schema/organization';
// import { betterAuth } from 'better-auth';
// import { organization } from 'better-auth/plugins/organization';
// import { ac } from './permissions';

export async function getUserRole(userId: string, organizationId: string | null | undefined) {
  if (!organizationId) {
    return null;
  }
  try {
    const currentUserRole = await db.select({
      role: organizationSchema.memberTable.role,
    })
      .from(organizationSchema.memberTable)
      .where(
        and(
          eq(organizationSchema.memberTable.userId, userId),
          eq(organizationSchema.memberTable.organizationId, organizationId),
        ),
      );

    const role = currentUserRole[0]?.role;

    return role;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return null;
  }
}

export async function getUserPermissions(userRole: string | null | undefined) {
  // Validate role
  if (!userRole || !['owner', 'admin', 'member'].includes(userRole)) {
    return false;
  }
  try {
    // Get organization plugin from auth
    const theOrg = organization || organization;
    if (!theOrg || typeof organization.checkRolePermission !== 'function') {
      console.error('Organization plugin not available');
      return false;
    }
    if (userRole !== 'owner' && userRole !== 'admin' && userRole !== 'member') {
      return false;
    }
    // Await the promise
    const hasAllPermissions = await organization.checkRolePermission({
      permissions: {
        organization: ['delete'],
        member: ['delete'],
      },
      role: userRole,
    });
    // This should now be a boolean
    return hasAllPermissions;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}
