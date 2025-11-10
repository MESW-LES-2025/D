import * as z from 'zod';

export const TeamGoalValidation = z.object({
  title: z.string().min(1, 'Goal title is required').min(3, 'Title must be at least 3 characters'),
  reward: z.string().optional(),
  description: z.string().optional(),
  target: z.string().optional(),
  dueDate: z.string().optional(),
  assignees: z.string().optional(),
});

export type TeamGoalFormData = z.infer<typeof TeamGoalValidation>;
