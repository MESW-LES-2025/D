'use client';

type MonthlyPointData = {
  month: string;
  monthLabel: string;
  totalPoints: number;
  transactionCount: number;
};

type PointHistoryTableProps = {
  data: MonthlyPointData[];
  totalPoints: number;
};

export function PointHistoryTable({ data, totalPoints }: PointHistoryTableProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {data.map((month) => (
          <div
            key={month.month}
            className="flex items-center justify-between rounded-md border p-4"
          >
            <div>
              <p className="font-medium">{month.monthLabel}</p>
              <p className="text-sm text-muted-foreground">
                {month.transactionCount}
                {' '}
                {month.transactionCount === 1 ? 'activity' : 'activities'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {month.totalPoints}
                {' '}
                points
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-md border-t border-dashed pt-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Total Points</p>
          <p className="text-xl font-bold">
            {totalPoints}
            {' '}
            points
          </p>
        </div>
      </div>
    </div>
  );
}

