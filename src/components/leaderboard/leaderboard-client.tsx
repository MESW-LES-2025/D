'use client';

import type { LeaderboardEntry, TimePeriod } from '@/app/(main)/leaderboard/actions';
import { useEffect, useState } from 'react';
import { getLeaderboardData } from '@/app/(main)/leaderboard/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Leaderboard } from './leaderboard';

type LeaderboardClientProps = {
  initialData: LeaderboardEntry[];
  currentUserId: string;
};

export function LeaderboardClient({
  initialData,
  currentUserId,
}: LeaderboardClientProps) {
  const [data, setData] = useState<LeaderboardEntry[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const freshData = await getLeaderboardData(timePeriod);
        setData(freshData);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [timePeriod]);

  return (
    <div className="relative">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="time-period" className="text-sm font-medium">
            Filter by:
          </label>
          <Select value={timePeriod} onValueChange={value => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger id="time-period" className="w-[140px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLoading && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>
      <Leaderboard data={data} currentUserId={currentUserId} />
    </div>
  );
}
