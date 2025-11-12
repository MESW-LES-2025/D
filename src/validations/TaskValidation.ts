import * as z from 'zod';

// TODO - Complete with all fields
export const TaskValidation = z.object({
  id: z.uuid('Valid Id is required'),
  status: z.enum(['to_do', 'in_progress', 'completed'], 'Valid Status is required'),
});
