import type {
  PieSectorDataItem,
} from 'recharts';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type Task = {
  difficulty: 'medium' | 'easy' | 'hard';
};

type ComplexityAnalysisChartProps = {
  currentUserTasks: Task[];
};

export function ComplexityAnalysisChart({
  currentUserTasks,
}: ComplexityAnalysisChartProps) {
  if (currentUserTasks.length === 0) {
    return (
      <Card className={cn('w-full py-4 gap-0')}>
        <CardHeader className="gap-0">
          <CardTitle className="mb-2 text-sm text-gray-400">
            Completed Task – Complexity Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold">
            No tasks yet
          </h3>
        </CardContent>
      </Card>
    );
  }

  const initialDifficulty = { hard: 0, medium: 0, easy: 0 };

  const tasksByDifficulty = currentUserTasks.reduce<typeof initialDifficulty>((acc, task) => {
    acc[task.difficulty] += 1;
    return acc;
  }, initialDifficulty);

  const data = [
    { name: 'Hard', value: tasksByDifficulty.hard, color: 'var(--muted)' },
    { name: 'Medium', value: tasksByDifficulty.medium, color: 'var(--muted-foreground)' },
    { name: 'Easy', value: tasksByDifficulty.easy, color: 'var(--primary)' },
  ];

  const renderActiveShape = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    payload,
    percent,
    value,
  }: PieSectorDataItem) => {
    if (value === 0) {
      return (
        <g></g>
      );
    }

    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * (midAngle ?? 1));
    const cos = Math.cos(-RADIAN * (midAngle ?? 1));
    const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
    const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
    const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
    const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="var(--primary)" fill="none" />
        <circle cx={ex} cy={ey} r={2} fill="var(--primary)" stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="var(--primary)">{payload.name}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
          {`${value} (${((percent ?? 1) * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  return (
    <Card className={cn('w-full py-4 gap-0')}>
      <CardHeader className="gap-0">
        <CardTitle className="mb-2 text-sm text-gray-400">
          Completed Task – Complexity Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              cornerRadius="8%"
              paddingAngle={4}
              dataKey="value"
              labelLine={false}
              label={renderActiveShape}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--muted-foreground)" />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
