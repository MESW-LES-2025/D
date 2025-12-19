'use server';

import { and, eq, gte, sql } from 'drizzle-orm';
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

export type TimePeriod = 'week' | 'month' | 'year' | 'all';

function getDateFilter(timePeriod: TimePeriod) {
  if (timePeriod === 'all') {
    return null;
  }

  const now = new Date();
  let startDate: Date;

  switch (timePeriod) {
    case 'week': {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      startDate = sevenDaysAgo;
      break;
    }
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;
    default:
      return null;
  }

  return startDate;
}

export async function fetchLeaderboardByOrganization(
  organizationId: string,
  timePeriod: TimePeriod = 'all',
): Promise<LeaderboardEntry[]> {
  try {
    const dateFilter = getDateFilter(timePeriod);

    const taskJoinConditions = [
      eq(taskTable.id, taskAssigneesTable.taskId),
      eq(taskTable.status, 'done'),
      eq(taskTable.organizationId, organizationId),
    ];

    if (dateFilter) {
      taskJoinConditions.push(
        gte(taskTable.updatedAt, dateFilter),
      );
    }

    const whereConditions = [eq(memberTable.organizationId, organizationId)];

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
      .leftJoin(taskTable, and(...taskJoinConditions))
      .where(and(...whereConditions))
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

export async function getLeaderboardData(
  timePeriod: TimePeriod = 'all',
): Promise<LeaderboardEntry[]> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || !session.session?.activeOrganizationId) {
    return [];
  }

  return fetchLeaderboardByOrganization(
    session.session.activeOrganizationId,
    timePeriod,
  );
}
