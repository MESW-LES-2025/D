import { IconCalendar, IconTarget, IconTrendingUp } from '@tabler/icons-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TeamGoalCardProps = {
  title: string;
  description: string;
  dueDate?: Date | null;
  currentValue: number;
  targetValue: number;
  className?: string;
};

export default function TeamGoalCard({ title, description, dueDate, currentValue, targetValue, className }: TeamGoalCardProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100);
  const isComplete = currentValue >= targetValue;

  const getDaysRemaining = () => {
    if (!dueDate) {
      return null;
    }
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isUrgent = daysRemaining !== null && daysRemaining <= 1 && daysRemaining >= 0;
  const isApproaching = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 1;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <IconTarget className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {dueDate && (
            <div
              className={`flex items-center gap-2 rounded-lg border p-3 ${
                isUrgent
                  ? 'border-destructive/50 bg-destructive/5'
                  : isApproaching
                    ? 'border-amber-600/50 bg-amber-600/5 dark:border-amber-400/50 dark:bg-amber-400/5'
                    : 'border-border bg-muted/50'
              }`}
            >
              <IconCalendar
                className={`size-4 ${
                  isUrgent ? 'text-destructive' : isApproaching ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                }`}
              />
              <div className="flex-1">
                <p className={cn('text-sm font-medium', isUrgent ? 'text-destructive' : isApproaching ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
                  {isUrgent ? `Last day` : `${daysRemaining} days left`}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {currentValue}
            {' '}
            /
            {targetValue}
            {' '}
            tasks
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}
            % complete
          </span>
          {isComplete && (
            <span className="flex items-center gap-1 text-xs font-medium text-primary">
              <IconTrendingUp className="size-3" />
              Goal reached!
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
