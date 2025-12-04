'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

type TaskStats = {
  total: number;
  completed: number;
  totalPoints: number;
  earnedPoints: number;
};

export function UserTaskProgress() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/tasks/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`Failed to fetch task stats: ${res.status}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
        console.error('Failed to fetch task stats:', e);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error ? `Error: ${error}` : 'No data available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const pointsPercentage = stats.totalPoints > 0 ? (stats.earnedPoints / stats.totalPoints) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tasks Completion */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Tasks Completed</span>
            <span className="font-semibold text-foreground">
              {stats.completed}
              /
              {stats.total}
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {completionPercentage.toFixed(0)}
            %
          </p>
        </div>

        {/* Points Earned */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">Points Earned</span>
            <span className="font-semibold text-foreground">
              {stats.earnedPoints}
              /
              {stats.totalPoints}
              {' '}
              pts
            </span>
          </div>
          <Progress value={pointsPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {pointsPercentage.toFixed(0)}
            %
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
