import * as z from 'zod';
import { avatarSchema, firstNameSchema, lastNameSchema, passwordSchema } from './AuthValidation';

export const UpdateNameValidation = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
});

export const UpdateAvatarValidation = z.object({
  image: avatarSchema,
});

export const UpdatePasswordValidation = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    newPasswordConfirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.newPasswordConfirmation, {
    message: 'Passwords do not match',
    path: ['newPasswordConfirmation'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const DeleteAccountValidation = z.object({
  password: z.string().min(1, 'Password is required to delete your account'),
});
