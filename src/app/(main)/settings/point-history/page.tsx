import type { Metadata } from 'next';
import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { format } from 'date-fns';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { PointHistoryChart } from './_components/point-history-chart';
import { PointHistoryFilters } from './_components/point-history-filters';
import { PointHistoryTable } from './_components/point-history-table';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { pointTransactionsTable } from '@/schema/points';

export const metadata: Metadata = {
  title: 'TaskUp | Point History',
  description: 'View your point history across all months',
};

type MonthlyPointData = {
  month: string;
  monthLabel: string;
  totalPoints: number;
  transactionCount: number;
};

async function getMonthlyPointData(
  userId: string,
  organizationId: string,
  startDate?: Date,
  endDate?: Date,
): Promise<MonthlyPointData[]> {
  const conditions = [
    eq(pointTransactionsTable.userId, userId),
    eq(pointTransactionsTable.organizationId, organizationId),
  ];

  if (startDate) {
    conditions.push(gte(pointTransactionsTable.createdAt, startDate));
  }

  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    conditions.push(lte(pointTransactionsTable.createdAt, endOfDay));
  }

  const transactions = await db
    .select({
      month: sql<string>`to_char(${pointTransactionsTable.createdAt}, 'YYYY-MM')`.as('month'),
      totalPoints: sql<number>`sum(${pointTransactionsTable.pointsChange})`.as('total_points'),
      transactionCount: sql<number>`count(*)`.as('transaction_count'),
    })
    .from(pointTransactionsTable)
    .where(and(...conditions))
    .groupBy(sql`to_char(${pointTransactionsTable.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${pointTransactionsTable.createdAt}, 'YYYY-MM')`);

  return transactions.map((t) => {
    const [year, month] = t.month.split('-');
    if (!year || !month) {
      return {
        month: t.month,
        monthLabel: t.month,
        totalPoints: Number(t.totalPoints) || 0,
        transactionCount: Number(t.transactionCount) || 0,
      };
    }
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    return {
      month: t.month,
      monthLabel: format(date, 'MMMM yyyy'),
      totalPoints: Number(t.totalPoints) || 0,
      transactionCount: Number(t.transactionCount) || 0,
    };
  });
}

export default async function PointHistoryPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string };
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in?callbackUrl=/settings/point-history');
  }

  const orgId = session.session?.activeOrganizationId;
  if (!orgId) {
    redirect('/dashboard');
  }

  const userId = session.user.id;

  let startDate: Date | undefined;
  let endDate: Date | undefined;

  if (searchParams.startDate) {
    const dateStr = searchParams.startDate;
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3 && parts.every(p => !Number.isNaN(p))) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      if (year !== undefined && month !== undefined && day !== undefined) {
        startDate = new Date(year, month - 1, day, 0, 0, 0, 0);
      }
    }
  }

  if (searchParams.endDate) {
    const dateStr = searchParams.endDate;
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3 && parts.every(p => !Number.isNaN(p))) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2];
      if (year !== undefined && month !== undefined && day !== undefined) {
        endDate = new Date(year, month - 1, day, 23, 59, 59, 999);
      }
    }
  }

  const monthlyData = await getMonthlyPointData(userId, orgId, startDate, endDate);

  const totalPoints = monthlyData.reduce((sum, month) => sum + month.totalPoints, 0);

  return (
    <div className="flex-1 space-y-6 xl:max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Point History</h1>
          <p className="text-sm text-muted-foreground">
            Track your points across all months
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PointHistoryFilters
            defaultStartDate={searchParams.startDate}
            defaultEndDate={searchParams.endDate}
          />
        </div>
      </div>

      {monthlyData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-sm text-muted-foreground">
            No point history found for the selected date range.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Points per Month</h2>
            <PointHistoryChart data={monthlyData} />
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Monthly Summary</h2>
            <PointHistoryTable data={monthlyData} totalPoints={totalPoints} />
          </div>
        </>
      )}
    </div>
  );
}

