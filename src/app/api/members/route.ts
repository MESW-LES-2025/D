import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { memberTable } from '@/schema/organization';
import { userTable } from '@/schema/user';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!session.session?.activeOrganizationId) {
    return NextResponse.json({ error: 'No active organization' }, { status: 400 });
  }

  try {
    // Get members from the organization
    const members = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
      })
      .from(memberTable)
      .innerJoin(userTable, eq(memberTable.userId, userTable.id))
      .where(eq(memberTable.organizationId, session.session.activeOrganizationId));

    // Always include the current user
    const currentUserExists = members.some(m => m.id === session.user.id);
    if (!currentUserExists && session.user.name && session.user.email) {
      members.unshift({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      });
    }

    return NextResponse.json(members);
  } catch (e) {
    console.error('Failed to fetch members for api/members', e);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
