import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type GoalCardProps = {
  completed: number;
  goal: number;
  timeFilter: 'week' | 'month';
};

export function GoalCard({ completed, goal, timeFilter }: GoalCardProps) {
  const percentage = goal === 0 ? 0 : Math.round((completed / goal) * 100);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={cn('w-full py-4 gap-0')}>
      <CardHeader className="gap-0">
        <CardTitle className="mb-2 text-sm text-gray-400">
          {timeFilter === 'week' ? 'Weekly' : 'Monthly'}
          {' '}
          Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-8 flex flex-col items-center justify-center py-4">
          <div className="relative h-40 w-40">
            <svg className="h-full w-full -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="var(--background);"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y="0%" x2="100%" y2="100%">
                  <stop offset="10%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--muted)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold">
                {percentage}
                %
              </h1>
              <span className="text-sm text-gray-400">Complete</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="mb-1 text-gray-400">
              {
                goal === 0
                  ? 'No tasks yet'
                  : `${completed} of ${goal} tasks`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
