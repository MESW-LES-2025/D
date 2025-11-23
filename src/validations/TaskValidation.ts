import * as z from 'zod';

export const TaskValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(5000).or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  dueDate: z.date().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
});
