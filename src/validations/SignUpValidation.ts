import * as z from 'zod';

export const SignUpValidation = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirmation: z.string(),
  image: z.instanceof(File).optional(),
}).refine(data => data.password === data.passwordConfirmation, {
  message: 'Passwords don\'t match',
  path: ['passwordConfirmation'],
});
