'use client';

import { IconCalendarMonth, IconCalendarWeek } from '@tabler/icons-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ViewToggle } from '../ui/view-toggle';
import { ComparisonCard } from './ComparisonCard';
import { ComplexityAnalysisChart } from './ComplexityAnalysisChart';
import { EmptyCard } from './EmptyCard';
import { GoalCard } from './GoalCard';
import { LeaderboardCard } from './LeaderboardCard';
import { PointsEarnedOverTimeChart } from './PointsEarnedOverTimeChart';

type Task = {
  id: string;
  dueDate: Date | null;
  difficulty: 'medium' | 'easy' | 'hard';
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'archived' | 'canceled';
  score: number;
};

type usersWithTasks = {
  taskId: string | null;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
};

type DashboardProps = {
  monthlyDoneTasks: Task[];
  usersWithTasks: usersWithTasks[];
  currentUsermonthlyTasks: Task[];
  serverDate: Date;
  currentUserId: string;
};

type UserStats = {
  image?: string | null;
  name: string | null;
  isCurrentUser: boolean;
  taskScore: number;
  taskCount: number;
};

type TimeFilterProps = {
  timeFilter: 'week' | 'month';
  setTimeFilter: (value: 'week' | 'month') => void;
};

function TimeFilter({ timeFilter, setTimeFilter }: TimeFilterProps) {
  return (
    <ViewToggle
      value={timeFilter}
      onValueChange={next => setTimeFilter(next as typeof timeFilter)}
      options={[
        { value: 'week', label: 'Week', icon: <IconCalendarWeek className="size-5" /> },
        { value: 'month', label: 'Month', icon: <IconCalendarMonth className="size-5" /> },
      ]}
      aria-label="Time filter"
      className="w-fit"
    />
  );
}

export function Dashboard({
  monthlyDoneTasks,
  usersWithTasks,
  currentUsermonthlyTasks,
  serverDate,
  currentUserId,
}: DashboardProps) {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('month');

  if (monthlyDoneTasks.length === 0 && currentUsermonthlyTasks.length === 0) {
    return (
      <EmptyCard timeFilter={null} />
    );
  }

  let tasksFiltered = monthlyDoneTasks;
  let currentUserTasksFiltered = currentUsermonthlyTasks;

  // If the filter is set to “month”, there’s no need to filter again, since we already fetch tasks for the current month.
  if (timeFilter === 'week') {
    // Monday start
    const firstDayOfWeek = new Date(serverDate);
    firstDayOfWeek.setDate(serverDate.getDate() - serverDate.getDay() + 1);
    firstDayOfWeek.setHours(0, 0, 0, 0);

    // Sunday end
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    tasksFiltered = tasksFiltered.filter(t => firstDayOfWeek <= t.dueDate! && t.dueDate! <= lastDayOfWeek);
    currentUserTasksFiltered = currentUsermonthlyTasks.filter(t => firstDayOfWeek <= t.dueDate! && t.dueDate! <= lastDayOfWeek);
  }

  if (tasksFiltered.length === 0 && currentUserTasksFiltered.length === 0) {
    return (
      <>
        <TimeFilter timeFilter={timeFilter} setTimeFilter={setTimeFilter} />
        <EmptyCard timeFilter={timeFilter} />
      </>
    );
  }

  // Filter the current user's tasks that are marked as done
  const currentUserTasksDone = currentUserTasksFiltered.filter(t => t.status === 'done');

  // Calculate total points earned by current user from completed tasks
  const pointsEarned = currentUserTasksDone.reduce((sum, task) => sum + (task.score || 0), 0);

  // Aggregate task statistics for all users
  const usersRecord = usersWithTasks.reduce<Record<string, UserStats>>((acc, i) => {
    let user = acc[i.user.id];
    if (!user) {
      user = {
        image: i.user.image,
        name: i.user.name,
        taskScore: 0,
        taskCount: 0,
        isCurrentUser: currentUserId === i.user.id,
      };
    }

    const task = tasksFiltered.find(task => task.id === i.taskId);

    user.taskScore += task?.score || 0;
    user.taskCount += task ? 1 : 0;

    acc[i.user.id] = user;

    return acc;
  }, {});
  const users = Object.values(usersRecord);

  return (
    <>
      <TimeFilter timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className={cn('w-full py-4 gap-0')}>
          <CardHeader className="gap-0">
            <CardTitle className="mb-2 text-sm text-gray-400">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="text-2xl font-bold">
              {currentUserTasksDone.length}
            </h1>
          </CardContent>
        </Card>

        <Card className={cn('w-full py-4 gap-0')}>
          <CardHeader className="gap-0">
            <CardTitle className="mb-2 text-sm text-gray-400">Points Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <h1 className="text-2xl font-bold">
              {pointsEarned.toLocaleString()}
              {' '}
              points
            </h1>
          </CardContent>
        </Card>
      </div>

      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GoalCard
          completed={currentUserTasksDone.length}
          goal={currentUserTasksFiltered.length}
          timeFilter={timeFilter}
        />
        <ComplexityAnalysisChart currentUserTasks={currentUserTasksDone} />
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PointsEarnedOverTimeChart currentUserTasks={currentUserTasksDone} tasks={tasksFiltered} />
        </div>
        <ComparisonCard currentUserPoints={pointsEarned} users={users} />
      </div>

      {/* Leaderboard */}
      <LeaderboardCard users={users} />
    </>
  );
}
