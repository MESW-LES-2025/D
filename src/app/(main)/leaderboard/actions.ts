'use server';

import { and, eq, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { memberTable } from '@/schema/organization';
import { taskAssigneesTable, taskTable } from '@/schema/task';
import { userTable } from '@/schema/user';

export type LeaderboardEntry = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  totalPoints: number;
};

export async function fetchLeaderboardByOrganization(
  organizationId: string,
): Promise<LeaderboardEntry[]> {
  try {
    const leaderboardData = await db
      .select({
        userId: userTable.id,
        name: userTable.name,
        email: userTable.email,
        image: userTable.image,
        totalPoints: sql<number>`COALESCE(SUM(${taskTable.score}), 0)`.as('total_points'),
      })
      .from(memberTable)
      .innerJoin(userTable, eq(memberTable.userId, userTable.id))
      .leftJoin(taskAssigneesTable, eq(taskAssigneesTable.userId, userTable.id))
      .leftJoin(
        taskTable,
        and(
          eq(taskTable.id, taskAssigneesTable.taskId),
          eq(taskTable.status, 'done'),
          eq(taskTable.organizationId, organizationId),
        ),
      )
      .where(eq(memberTable.organizationId, organizationId))
      .groupBy(userTable.id, userTable.name, userTable.email, userTable.image)
      .orderBy(sql`total_points DESC`);

    return leaderboardData.map(entry => ({
      userId: entry.userId,
      name: entry.name,
      email: entry.email,
      image: entry.image,
      totalPoints: Number(entry.totalPoints),
    }));
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return [];
  }
}

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.session?.activeOrganizationId) {
    return [];
  }

  return fetchLeaderboardByOrganization(session.session.activeOrganizationId);
}
