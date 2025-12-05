'use client';

import { useEffect, useState } from 'react';
import { getLeaderboardData, type LeaderboardEntry } from '@/app/(main)/leaderboard/actions';
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

  useEffect(() => {
    const interval = setInterval(async () => {
      setIsLoading(true);
      try {
        const freshData = await getLeaderboardData();
        setData(freshData);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute right-0 top-0">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <Leaderboard data={data} currentUserId={currentUserId} />
    </div>
  );
}


