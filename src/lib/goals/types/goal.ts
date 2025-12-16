export type TeamGoalData = {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  status: 'active' | 'paused' | 'completed' | 'archived';
  dueDate: Date | null;
  completedAt: Date | null;
};
