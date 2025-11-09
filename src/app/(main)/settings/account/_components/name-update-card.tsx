'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useEffect, useTransition } from 'react';
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
import { UpdateNameValidation } from '@/validations/AccountValidation';
import { NameUpdateCardSkeleton } from './skeletons';

type NameFormData = z.infer<typeof UpdateNameValidation>;

type NameUpdateCardProps = {
  className?: string;
} & React.ComponentProps<'div'>;

export function NameUpdateCard({ className, ...props }: NameUpdateCardProps) {
  const { user, isLoading } = useSession();
  const [loading, startTransition] = useTransition();

  // Parse current name into first and last name
  const currentName = user?.name || '';
  const nameParts = currentName.trim().split(' ');
  const currentFirstName = nameParts[0] || '';
  const currentLastName = nameParts.slice(1).join(' ') || '';

  const form = useForm<NameFormData>({
    resolver: zodResolver(UpdateNameValidation),
    defaultValues: {
      firstName: currentFirstName,
      lastName: currentLastName,
    },
  });

  // Update form when session data changes
  useEffect(() => {
    if (user?.name) {
      form.reset({
        firstName: currentFirstName,
        lastName: currentLastName,
      });
    }
  }, [currentFirstName, currentLastName, form, user?.name]);

  const onSubmit = async (values: NameFormData) => {
    startTransition(async () => {
      try {
        const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;

        await client.updateUser({
          name: fullName,
        });

        toast.success('Name updated successfully!');
      } catch (error) {
        console.error('Name update error:', error);
        toast.error('Failed to update name. Please try again.');
      }
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <NameUpdateCardSkeleton />
    );
  }

  // No session state
  if (!user) {
    return null;
  }

  return (
    <Card className={cn('w-full py-4', className)} {...props}>
      <CardHeader className="gap-0 pb-4">
        <CardTitle className="text-lg font-semibold">Name</CardTitle>
        <CardDescription className="text-sm">
          Update your first and last name
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 px-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="bg-background"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="bg-background"
                        disabled={loading}
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
                        Saving...
                      </div>
                    )
                  : (
                      'Save'
                    )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
