'use client';

import Image from 'next/image';

type LeaderboardEntry = {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  totalPoints: number;
};

type LeaderboardProps = {
  data: LeaderboardEntry[];
  currentUserId: string;
};

export function Leaderboard({ data, currentUserId }: LeaderboardProps) {
  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No team members found or no completed tasks yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((entry, index) => {
        const rank = index + 1;
        const isCurrentUser = entry.userId === currentUserId;

        return (
          <div
            key={entry.userId}
            className={`flex items-center gap-4 rounded-lg border p-4 ${
              isCurrentUser
                ? 'border-primary bg-primary/5'
                : 'bg-card'
            }`}
          >
            <div className="flex w-12 items-center justify-center">
              <span
                className={`text-lg font-bold ${
                  rank === 1
                    ? 'text-yellow-500'
                    : rank === 2
                      ? 'text-gray-400'
                      : rank === 3
                        ? 'text-amber-600'
                        : 'text-muted-foreground'
                }`}
              >
                #
                {rank}
              </span>
            </div>

            {entry.image
              ? (
                  <Image
                    src={entry.image}
                    alt={entry.name || 'User'}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full"
                  />
                )
              : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                    <span className="text-lg font-medium">
                      {entry.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-card-foreground">
                  {entry.name || 'No name'}
                </p>
                {isCurrentUser && (
                  <span className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{entry.email}</p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-card-foreground">
                {entry.totalPoints}
              </p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
