import * as z from 'zod';

export const TeamGoalValidation = z.object({
  title: z.string().min(1, 'Goal title is required').min(3, 'Title must be at least 3 characters'),
  pointsReward: z.string().min(1, 'Points reward is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  assigneeIds: z.array(z.string()).min(1, 'Select at least one assignee'),
  taskIds: z.array(z.string()).min(1, 'Select at least one related task'),
});

export type TeamGoalFormData = z.infer<typeof TeamGoalValidation>;
