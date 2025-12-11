import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { UserPointsClient } from '@/components/layout/user-points-client';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { userPointsTable } from '@/schema';

export async function UserPointsDisplay() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  try {
    const orgId = session.session?.activeOrganizationId ?? '';
    const userId = session.user.id;

    // Fetch user's total points from the user_points table
    const [userPoints] = await db
      .select()
      .from(userPointsTable)
      .where(
        and(
          eq(userPointsTable.userId, userId),
          eq(userPointsTable.organizationId, orgId),
        ),
      )
      .limit(1);

    const earnedPoints = userPoints?.totalPoints ?? 0;

    return <UserPointsClient earnedPoints={earnedPoints} />;
  } catch (e) {
    console.error('Failed to fetch user points:', e);
    return null;
  }
}
