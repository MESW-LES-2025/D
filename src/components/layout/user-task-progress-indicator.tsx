'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

type TaskStats = {
  total: number;
  completed: number;
  totalPoints: number;
  earnedPoints: number;
};

export function UserTaskProgressIndicator() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/tasks/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch task stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Set up polling to refresh stats every 5 seconds
    const interval = setInterval(fetchStats, 5000);

    // Listen for custom events when tasks are updated
    const handleTaskUpdate = () => {
      fetchStats();
    };

    window.addEventListener('task-updated', handleTaskUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('task-updated', handleTaskUpdate);
    };
  }, []);

  if (loading) {
    return null;
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground">No tasks available</div>
      </div>
    );
  }

  const completionPercentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const isComplete = stats.completed === stats.total && stats.total > 0;

  return (
    <div className="space-y-3">
      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">
            {stats.completed}
            /
            {stats.total}
            {' '}
            tasks
          </span>
        </div>
        <Progress
          value={completionPercentage}
          className={`h-2 ${isComplete ? '[&>div]:bg-green-500' : ''}`}
        />
      </div>

      {/* Points Section */}
      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">Total Points</div>
        <div className="font-semibold text-foreground">
          {stats.earnedPoints}
          {' '}
          pts
        </div>
      </div>
    </div>
  );
}
