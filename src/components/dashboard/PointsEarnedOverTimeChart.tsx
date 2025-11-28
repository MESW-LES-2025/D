import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type PointsEarnedOverTimeChartProps = {
  currentUserTasks: Task[];
  tasks: Task[];
};

type Task = {
  id: string;
  dueDate: Date | null;
  difficulty: 'medium' | 'easy' | 'hard';
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'archived' | 'canceled';
  score: number;
};

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

type GroupedScores = Record<string, number>;

export function PointsEarnedOverTimeChart({
  currentUserTasks,
  tasks,
}: PointsEarnedOverTimeChartProps) {
  const data = [];

  // Group tasks by due date and sum their scores
  const grouped = tasks.reduce<GroupedScores>((acc, task) => {
    const dateKey = formatDate(task.dueDate!);
    acc[dateKey] = (acc[dateKey] || 0) + task.score;
    return acc;
  }, {});

  // Convert grouped data into chart-friendly format
  for (const [date, teamPoints] of Object.entries(grouped)) {
    const currentUserTask = currentUserTasks.filter(currentUserTask => formatDate(currentUserTask.dueDate!) === date);

    // Sum the current user’s points for that date
    const currentUserPoints = currentUserTask?.reduce((sum, task) => sum + (task.score || 0), 0) || 0;

    data.push({
      date,
      currentUserPoints,
      teamPoints,
    });
  }

  return (
    <Card className={cn('w-full py-4 gap-0')}>
      <CardHeader className="gap-0">
        <CardTitle className="mb-6 flex items-center justify-between text-sm text-gray-400">
          Points Earned Over Time
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-muted-foreground bg-muted" />
              <span className="text-gray-400">Your Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border border-muted bg-primary" />
              <span className="text-gray-400">Team Points</span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1a1a1a"
            />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{
                value: 'Points',
                angle: -90,
                position: 'insideLeft',
                fill: '#6b7280',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
                color: '#ffffff',
              }}
            />
            <Area
              type="monotone"
              dataKey="teamPoints"
              stroke="var(--muted-foreground)"
              strokeWidth={3}
              fill="var(--primary)"
            />

            <Area
              type="monotone"
              dataKey="currentUserPoints"
              stroke="var(--primmary)"
              strokeWidth={3}
              fill="var(--muted)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
