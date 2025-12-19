import { z } from 'zod';

export const orgLogoSchema = z
  .instanceof(File)
  .refine(file => file.size > 0, {
    message: 'File cannot be empty',
  })
  .refine(file => file.size <= 5 * 1024 * 1024, {
    message: 'File size must be less than 5MB',
  })
  .refine(
    file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    {
      message: 'File must be a valid image format (JPEG, PNG, or WebP)',
    },
  )
  .refine(
    (file) => {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    },
    {
      message: 'File must have a valid image extension',
    },
  );

export const CreateRewardValidation = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  points: z.number().int().min(0, 'Points must be 0 or greater'),
  picture: orgLogoSchema.optional(),
});

export const InviteOrganizationMemberValidation = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  role: z.enum(['admin', 'member', 'owner']),
});

export const UpdateMemberRoleValidation = z.object({
  role: z.enum(['admin', 'member', 'owner']),
});

// Add the new Task validation schema
export const CreateTaskValidation = z.object({
  title: z
    .string()
    .min(1, { message: 'Title is required' })
    .max(100, { message: 'Title must be less than 100 characters' }),
  description: z
    .string()
    .max(500, { message: 'Description must be less than 500 characters' })
    .optional()
    .default(''),
  points: z.coerce
    .number()
    .int({ message: 'Points must be a whole number' })
    .min(0, { message: 'Points must be 0 or greater' })
    .max(1000, { message: 'Points must be 1000 or less' })
    .default(0),
  picture: orgLogoSchema.optional(),
});
