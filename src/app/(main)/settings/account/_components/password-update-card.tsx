'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useSession } from '@/hooks/use-session';
import { client } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { UpdatePasswordValidation } from '@/validations/AccountValidation';
import { PasswordUpdateCardSkeleton } from './skeletons';

type PasswordFormData = z.infer<typeof UpdatePasswordValidation>;

type PasswordUpdateCardProps = {
  className?: string;
} & React.ComponentProps<'div'>;

export function PasswordUpdateCard({
  className,
  ...props
}: PasswordUpdateCardProps) {
  const { user, isLoading } = useSession();
  const [loading, startTransition] = useTransition();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(UpdatePasswordValidation),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      newPasswordConfirmation: '',
    },
  });

  const onSubmit = async (values: PasswordFormData) => {
    startTransition(async () => {
      try {
        const { error } = await client.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          revokeOtherSessions: true, // Revoke other sessions for security
        });

        if (error) {
          console.error('Password change error:', error);

          // Handle specific error cases
          if (error.message?.toLowerCase().includes('incorrect')) {
            toast.error('Current password is incorrect');
          } else {
            toast.error(
              error.message || 'Failed to update password. Please try again.',
            );
          }
          return;
        }

        // Reset form on success
        form.reset({
          currentPassword: '',
          newPassword: '',
          newPasswordConfirmation: '',
        });

        toast.success('Password updated successfully! Other sessions have been logged out.');
      } catch (error) {
        console.error('Password update error:', error);
        toast.error('Failed to update password. Please try again.');
      }
    });
  };

  if (isLoading) {
    return (
      <PasswordUpdateCardSkeleton />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Card className={cn('w-full py-4', className)} {...props}>
      <CardHeader className="gap-0 pb-4">
        <CardTitle className="text-lg font-semibold">Password</CardTitle>
        <CardDescription className="text-sm">
          Change your account password
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your current password"
                        className="bg-background"
                        disabled={loading}
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        className="bg-background"
                        disabled={loading}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPasswordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your new password"
                        className="bg-background"
                        disabled={loading}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="w-full" />

            <div className="px-6">
              <Button type="submit" disabled={loading}>
                {loading
                  ? (
                      <div className="flex items-center gap-2">
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        Updating Password...
                      </div>
                    )
                  : (
                      'Update Password'
                    )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
