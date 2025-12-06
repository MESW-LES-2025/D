import * as z from 'zod';

export const TaskValidation = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  status: z.enum(['backlog', 'todo', 'in_progress', 'review', 'done', 'archived', 'canceled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  dueDate: z.date().optional().nullable(),
  assigneeIds: z.array(z.string()).optional(),
});
