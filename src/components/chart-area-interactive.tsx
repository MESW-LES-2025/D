'use client';

import type { ChartConfig } from '@/components/ui/chart';
import * as React from 'react';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';

export const description = 'An interactive task priority bar chart';

const chartConfig = {
  tasks: {
    label: 'Tasks',
  },
  urgent: {
    label: 'Urgent',
    color: 'var(--chart-4)',
  },
  high: {
    label: 'High',
    color: 'var(--chart-3)',
  },
  medium: {
    label: 'Medium',
    color: 'var(--chart-2)',
  },
  low: {
    label: 'Low',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type TaskPriorityChartProps = {
  data: Array<{
    date: string;
    urgent: number;
    high: number;
    medium: number;
    low: number;
  }>;
};

export default function TaskPriorityChart({ data }: TaskPriorityChartProps) {
  const [timeRange, setTimeRange] = React.useState('7d');

  const filteredData = data.filter((item) => {
    const date = new Date(item.date ?? '');
    const today = new Date();
    let daysToSubtract = 30;
    if (timeRange === '15d') {
      daysToSubtract = 15;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Tasks Completed</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Tasks completed by priority over time
          </span>
          <span className="@[540px]/card:hidden">Last month</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="15d">Last 15 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="15d" className="rounded-lg">
                Last 15 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="urgent"
              stackId="a"
              fill="var(--color-urgent)"
              radius={[0, 0, 0, 0]}
              strokeWidth={2}
            />
            <Bar
              dataKey="high"
              stackId="a"
              fill="var(--color-high)"
              radius={[0, 0, 0, 0]}
              strokeWidth={2}
            />
            <Bar
              dataKey="medium"
              stackId="a"
              fill="var(--color-medium)"
              radius={[0, 0, 0, 0]}
              strokeWidth={2}
            />
            <Bar
              dataKey="low"
              stackId="a"
              fill="var(--color-low)"
              radius={[4, 4, 0, 0]}
              strokeWidth={2}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
