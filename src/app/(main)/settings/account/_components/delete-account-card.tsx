'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { DeleteAccountValidation } from '@/validations/AccountValidation';
import { DeleteAccountCardSkeleton } from './skeletons';

type DeleteAccountFormData = z.infer<typeof DeleteAccountValidation>;

type DeleteAccountCardProps = {
  className?: string;
} & React.ComponentProps<'div'>;

export function DeleteAccountCard({
  className,
  ...props
}: DeleteAccountCardProps) {
  const { user, isLoading } = useSession();
  const [loading, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const form = useForm<DeleteAccountFormData>({
    resolver: zodResolver(DeleteAccountValidation),
    defaultValues: {
      password: '',
    },
  });

  const onSubmit = async (values: DeleteAccountFormData) => {
    startTransition(async () => {
      try {
        const { error } = await client.deleteUser({
          password: values.password,
          callbackURL: '/sign-in',
        });

        if (error) {
          console.error('Account deletion error:', error);
          toast.error(
            error.message
            || 'Failed to delete account. Please check your password.',
          );
          return;
        }

        toast.success('Account deleted successfully. Goodbye!');
        setIsDialogOpen(false);
        router.push('/sign-in');
      } catch (error) {
        console.error('Account deletion error:', error);
        toast.error('Failed to delete account. Please try again.');
      }
    });
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    form.reset({ password: '' });
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    form.reset({ password: '' });
  };

  if (isLoading) {
    return (
      <DeleteAccountCardSkeleton />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Card
        className={cn('w-full py-4 border-destructive', className)}
        {...props}
      >
        <CardHeader className="gap-0 pb-4">
          <CardTitle className="text-lg font-semibold text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription className="text-sm">
            Permanently delete your account and all of its contents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <ul className="list-inside list-disc space-y-1 px-6 text-sm text-muted-foreground">
            <li>Your account will be permanently deleted</li>
            <li>
              All your data, including settings and analytics, will be removed
            </li>
            <li>This action cannot be undone and is instantaneous</li>
          </ul>

          <Separator className="w-full bg-destructive" />

          <div className="flex justify-end px-6">
            <Button
              variant="destructive"
              disabled={loading}
              onClick={handleOpenDialog}
            >
              {loading
                ? (
                    <div className="flex items-center gap-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </div>
                  )
                : (
                    'Delete Account'
                  )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password to confirm"
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

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={loading}>
                  {loading
                    ? (
                        <div className="flex items-center gap-2">
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                          Deleting...
                        </div>
                      )
                    : (
                        'Delete Account'
                      )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
