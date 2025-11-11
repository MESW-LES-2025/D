import * as z from 'zod';

export const TaskValidation = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  dueDate: z.coerce.date().optional().nullable(),
  assigneeId: z.string().min(1).optional(),
  groupId: z.string().min(1).optional(),
});
