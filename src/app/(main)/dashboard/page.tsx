import type { Metadata } from 'next';

import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TaskPriorityChart from '@/components/chart-area-interactive';
import { NoOrganization } from '@/components/empty/no-organization';
import TeamGoals from '@/components/goals/team-goals';

import { columns as adminColumns } from '@/components/tasks/admin-table/columns';
import { DataTable as AdminDataTable } from '@/components/tasks/admin-table/data-table';
import { columns } from '@/components/tasks/table/columns';
import { DataTable } from '@/components/tasks/table/data-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { auth } from '@/lib/auth/auth';
import { getTeamGoals } from '@/lib/goals/queries/get-team-goals';
import { getActiveTasksMetric } from '@/lib/task/queries/get-active-tasks-metric';
import { getCompletedTasksMetric } from '@/lib/task/queries/get-completed-tasks-metric';
import { getOnTimeCompletionMetric } from '@/lib/task/queries/get-ontime-completion-metric';
import { getPointsEarnedMetric } from '@/lib/task/queries/get-points-earned-metric';
import { getTaskCompletionChartData } from '@/lib/task/queries/get-task-completion-chart-data';
import { getTasksWithAssignees } from '@/lib/task/queries/get-tasks-with-assignees';
import { getWeekRanges } from '@/lib/task/utils/get-week-ranges';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'TaskUp | Dashboard',
  description: 'Your personal dashboard to manage tasks efficiently.',
};

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }
  if (!session.session?.activeOrganizationId) {
    return <NoOrganization />;
  }

  const organizationId = session.session.activeOrganizationId;
  const userId = session.session.userId;
  const isAdmin = false;
  const { currentWeek, lastWeek } = getWeekRanges();

  // Fetch all data in parallel
  const [
    completedMetric,
    onTimeMetric,
    activeMetric,
    pointsMetric,
    tasks,
    chartData,
    teamGoals,
  ] = await Promise.all([
    getCompletedTasksMetric(organizationId, currentWeek, lastWeek),
    getOnTimeCompletionMetric(organizationId, currentWeek, lastWeek),
    getActiveTasksMetric(organizationId),
    getPointsEarnedMetric(organizationId, userId, currentWeek, lastWeek),
    getTasksWithAssignees(organizationId, userId, isAdmin),
    getTaskCompletionChartData(organizationId, 90),
    getTeamGoals(organizationId, 2),
  ]);

  // Destructure metrics for easier access
  const {
    value: completedCount,
    total: allCount,
    trend: completedTrend,
  } = completedMetric;

  const {
    rate: onTimeRateThisWeek,
    trend: onTimeTrend,
  } = onTimeMetric;

  const {
    value: activeTasksCount,
    trend: activeTasksTrend,
  } = activeMetric;

  const {
    userPoints: pointsEarnedScore,
    teamPoints: pointsTeamEarnedScore,
    trend: pointsEarnedTrend,
  } = pointsMetric;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 ">
      {/* Card Section */}
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {/* Card 1: Tasks Completed */}
        <Card className="@container/card flex flex-col">
          <CardHeader>
            <CardDescription>Tasks Completed</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {completedCount}
              <span className="ml-1 text-muted-foreground">
                /
                {' '}
                {allCount}
              </span>
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className={cn(
                  completedTrend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : completedTrend < 0
                      ? 'text-red-600 dark:text-red-400'
                      : undefined,
                )}
              >
                {completedTrend >= 0 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
                {completedTrend.toFixed(0)}
                %
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
            <div className="h-10 text-muted-foreground">
              Completed tasks this week.
            </div>
          </CardFooter>
        </Card>

        {/* Card 2: On-Time Completion Rate */}
        <Card className="@container/card flex flex-col">
          <CardHeader>
            <CardDescription>On-Time Completion</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {onTimeRateThisWeek}
              %
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className={cn(
                  onTimeTrend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : onTimeTrend < 0
                      ? 'text-red-600 dark:text-red-400'
                      : undefined,
                )}
              >
                {onTimeTrend >= 0 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
                {onTimeTrend.toFixed(0)}
                %
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
            <div className="h-10 text-muted-foreground">
              Percentage of tasks completed before due date
            </div>
          </CardFooter>
        </Card>

        {/* Card 3: Active Tasks */}
        <Card className="@container/card flex flex-col">
          <CardHeader>
            <CardDescription>Active Tasks</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {activeTasksCount}
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className={cn(
                  activeTasksTrend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : activeTasksTrend < 0
                      ? 'text-red-600 dark:text-red-400'
                      : undefined,
                )}
              >
                {activeTasksTrend >= 0 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
                {activeTasksTrend.toFixed(0)}
                %
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
            <div className="h-10 text-muted-foreground">
              New tasks added this week.
            </div>
          </CardFooter>
        </Card>

        {/* Card 4: Points Earned */}
        <Card className="@container/card flex flex-col">
          <CardHeader>
            <CardDescription>Points Earned</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {pointsEarnedScore}
              <span className="ml-1 text-muted-foreground">
                /
                {pointsTeamEarnedScore}
              </span>
            </CardTitle>
            <CardAction>
              <Badge
                variant="outline"
                className={cn(
                  pointsEarnedTrend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : pointsEarnedTrend < 0
                      ? 'text-red-600 dark:text-red-400'
                      : undefined,
                )}
              >
                {pointsEarnedTrend >= 0 ? <IconTrendingUp className="size-3" /> : <IconTrendingDown className="size-3" />}
                {pointsEarnedTrend.toFixed(0)}
                %
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="mt-auto flex-col items-start gap-1.5 text-sm">
            <div className="h-10 text-muted-foreground">
              Your points earned vs team total this week.
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Chart */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:h-100 @5xl/main:grid-cols-2">
        <TaskPriorityChart data={chartData} />
        <TeamGoals data={teamGoals} />
      </div>

      {/* Table */}
      <div className="px-4 lg:px-6">
        {isAdmin
          ? (
              <AdminDataTable data={tasks} columns={adminColumns} isAdmin={isAdmin} />
            )
          : <DataTable data={tasks} columns={columns} isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
