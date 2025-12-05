import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { UserPointsClient } from '@/components/layout/user-points-client';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';

import { taskAssigneesTable, taskTable } from '@/schema/task';
// import { UserPointsClient } from '/user-points-client';

export async function UserPointsDisplay() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  try {
    const orgId = session.session?.activeOrganizationId ?? '';
    const userId = session.user.id;

    // Fetch tasks assigned to the current user in the organization
    const tasks = await db
      .select({
        id: taskTable.id,
        status: taskTable.status,
        score: taskTable.score,
      })
      .from(taskTable)
      .innerJoin(
        taskAssigneesTable,
        eq(taskTable.id, taskAssigneesTable.taskId),
      )
      .where(
        and(
          eq(taskTable.organizationId, orgId),
          eq(taskAssigneesTable.userId, userId),
        ),
      );

    // Calculate earned points
    const earnedPoints = tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.score ?? 0), 0);

    return <UserPointsClient earnedPoints={earnedPoints} />;
  } catch (e) {
    console.error('Failed to fetch user points:', e);
    return null;
  }
}
