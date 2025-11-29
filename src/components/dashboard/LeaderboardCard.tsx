import {
  Award,
  Medal,
  Trophy,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type LeaderboardCardProps = {
  users: UserStats[];
};

type UserStats = {
  image?: string | null;
  name: string | null;
  isCurrentUser: boolean;
  taskScore: number;
  taskCount: number;
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-orange-600" />;
    default:
      return (
        <span className="text-gray-500">
          #
          {rank}
        </span>
      );
  }
};

export function LeaderboardCard({
  users,
}: LeaderboardCardProps) {
  users.sort((a, b) => b.taskScore - a.taskScore || b.taskCount - b.taskCount);

  return (
    <>
      <Card className={cn('w-full py-4 gap-0')}>
        <CardHeader className="gap-0">
          <CardTitle className="mb-6 text-sm text-gray-400">
            Team Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((entry, index) => (
            <div key={`user-${index}`} className="flex items-center gap-4 rounded-lg bg-muted p-4 transition-all">
              {/* Rank */}
              <div className="flex w-8 items-center justify-center">
                {getRankIcon(index + 1)}
              </div>

              {/* Avatar */}
              <div className="text-2xl">
                {entry.image
                  ? (
                      <Image
                        src={entry.image || ''}
                        alt={entry.name || 'user'}
                        className="h-8 w-8 rounded-full"
                      />
                    )
                  : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted-foreground">
                        <span className="text-sm font-medium">
                          {entry.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}

              </div>

              {/* Name */}
              <div className="flex-1">
                <h3 className="font-bold">
                  {entry.name}
                  {entry.isCurrentUser && (
                    <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      You
                    </span>
                  )}
                </h3>
              </div>

              {/* Tasks and Points count */}
              <div className="min-w-[100px] text-right">
                <p className="font-bold">
                  {entry.taskScore.toLocaleString()}
                  {' '}
                  pts
                </p>
                <p className="text-sm">
                  {entry.taskCount}
                  {' '}
                  tasks
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
