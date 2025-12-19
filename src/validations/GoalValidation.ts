import * as z from 'zod';

export const CreateGoalValidation = z.object({
  name: z.string().min(1, 'Goal name is required').max(100, 'Goal name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  points: z.number().int().min(1, 'Target must be at least 1').max(10000, 'Target is too large'),
  dueDate: z.date().optional(),
  taskIds: z.array(z.string()).min(1, 'At least one task must be selected'),
});

export type CreateGoalFormData = z.infer<typeof CreateGoalValidation>;
