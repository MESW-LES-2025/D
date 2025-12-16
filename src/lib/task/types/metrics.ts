export type DateRange = {
  start: Date;
  end: Date;
};

export type MetricResult = {
  value: number;
  trend: number;
};

export type CompletedTasksMetric = {
  total: number; // Total tasks (completed + incomplete)
} & MetricResult;

export type OnTimeCompletionMetric = {
  rate: number; // Percentage as a whole number (0-100)
} & MetricResult;

export type ActiveTasksMetric = {
  // value contains the count of active tasks
  // trend contains the percentage change
} & MetricResult;

export type PointsEarnedMetric = {
  userPoints: number; // Points earned by the current user
  teamPoints: number; // Total points earned by the team
} & MetricResult;
