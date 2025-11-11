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

export const CreateOrganizationValidation = z.object({
  name: z
    .string()
    .min(2, { message: 'Organization name must be at least 2 characters' })
    .max(50, { message: 'Organization name must be less than 50 characters' }),
  slug: z
    .string()
    .min(2, { message: 'Slug must be at least 2 characters' })
    .max(50, { message: 'Slug must be less than 50 characters' })
    .regex(/^[a-z0-9-]+$/, {
      message: 'Slug can only contain lowercase letters, numbers, and hyphens',
    }),
  logo: orgLogoSchema.optional(),
});

export const InviteOrganizationMemberValidation = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  role: z.enum(['admin', 'member', 'owner']),
});
