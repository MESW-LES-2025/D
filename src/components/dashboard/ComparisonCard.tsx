import { IconTrendingUp } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type ComparisonCardProps = {
  currentUserPoints: number;
  users: UserStats[];
};

type UserStats = {
  image?: string | null;
  name: string | null;
  taskScore: number;
  taskCount: number;
};

function warning(currentUserAboveTemAverage: boolean, currentUserPoints: number, teamAveragePoints: number) {
  if (currentUserPoints === 0 && teamAveragePoints === 0) {
    return '';
  }

  const percent = ((currentUserPoints - teamAveragePoints) / teamAveragePoints) * 100;
  const percentFormated = Math.abs(percent).toFixed(1).toLocaleString();

  if (currentUserAboveTemAverage) {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
        <div className="flex items-start gap-2">
          <IconTrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
          <div>
            <p className="mb-1">Outstanding Performance!</p>
            <p className="text-sm text-green-400">
              You're
              {' '}
              {percentFormated}
              % above team average
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
      <div className="flex items-start gap-2">
        <IconTrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
        <div>
          <p className="mb-1">Keep Going — You’ve Got This!</p>
          <p className="text-sm text-red-400">
            { currentUserPoints === 0
              ? 'No points yet, but great things begin from zero!'
              : `You’re trending ${percentFormated} % below the team average right now.`}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ComparisonCard({ currentUserPoints, users }: ComparisonCardProps) {
  const teamTotalScore = users.reduce((sum, user) => sum + user.taskScore, 0);

  const teamAveragePoints = users.length > 0
    ? teamTotalScore / users.length
    : 0;

  const currentUserAboveTemAverage = currentUserPoints >= teamAveragePoints;

  return (
    <Card className={cn('w-full py-4 gap-0')}>
      <CardHeader className="gap-0">
        <CardTitle className="mb-8 text-sm text-gray-400">
          You vs. Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 py-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-gray-400">You</span>
            <span className="font-bold">
              {currentUserPoints.toLocaleString()}
              {' '}
              points
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-muted-foreground transition-all duration-1000"
              style={{ width: currentUserAboveTemAverage ? '100%' : `${(currentUserPoints / teamAveragePoints) * 100}%` }}
            />
          </div>
        </div>

        {/* Team average */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-gray-400">Team Average</span>
            <span className="font-bold">
              {teamAveragePoints.toFixed(1).toLocaleString()}
              {' '}
              points
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000"
              style={{ width: !currentUserAboveTemAverage ? '100%' : `${(teamAveragePoints / currentUserPoints) * 100}%` }}
            />
          </div>
        </div>

        {warning(currentUserAboveTemAverage, currentUserPoints, teamAveragePoints)}

      </CardContent>
    </Card>
  );
}
