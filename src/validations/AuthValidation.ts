import * as z from 'zod';

export const firstNameSchema = z.string()
  .min(1, 'First name is required')
  .max(50, 'First name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\u00C0-\u00FF\s'-]+$/,
    'First name can only contain letters, spaces, apostrophes, and hyphens',
  );

export const lastNameSchema = z.string()
  .min(1, 'Last name is required')
  .max(50, 'Last name must be less than 50 characters')
  .regex(
    /^[a-zA-Z\u00C0-\u00FF\s'-]+$/,
    'Last name can only contain letters, spaces, apostrophes, and hyphens',
  );

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  );

export const SignInValidation = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean(),
});

export const avatarSchema = z
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

export const SignUpValidation = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: z.email('Please enter a valid email address'),
  password: passwordSchema,
  passwordConfirmation: z.string(),
  image: avatarSchema.optional(),
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Passwords don\'t match',
  path: ['passwordConfirmation'],
});
