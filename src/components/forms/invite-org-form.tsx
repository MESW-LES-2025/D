'use client';

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCheck, IconCopy, IconLoader2 } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { client } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { InviteOrganizationMemberValidation } from '@/validations/OrganizationValidation';
import { Label } from '../ui/label';

type FormData = z.infer<typeof InviteOrganizationMemberValidation>;

type InviteOrgFormProps = React.ComponentProps<'form'> & {
  onSuccess?: () => void;
};

export function InviteOrgForm({ className, onSuccess, ...props }: InviteOrgFormProps) {
  const [loading, startTransition] = useTransition();
  const { data: session } = client.useSession();
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(InviteOrganizationMemberValidation),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const copyToClipboard = async () => {
    if (!invitationLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      try {
        // Check if user has an active organization
        const activeOrgId = session?.session?.activeOrganizationId;

        if (!activeOrgId) {
          toast.error('No active organization. Please create or select an organization first.');
          return;
        }

        const { data, error } = await client.organization.inviteMember({
          email: values.email,
          role: values.role,
          organizationId: activeOrgId,
          resend: true,
        });

        if (error) {
          toast.error(error.message || 'Failed to create invitation');
          return;
        }

        if (data?.id) {
          // Get the app URL
          const baseUrl = typeof window !== 'undefined'
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          const link = `${baseUrl}/accept-invitation/${data.id}`;
          setInvitationLink(link);
          toast.success('Invitation created! Share the link below.');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create invitation');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-6', className)} {...props}>

        {!invitationLink
          ? (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="colleague@example.com"
                          className="bg-background"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )
          : (
              <div className="rounded-lg">
                <Label className="mb-2 text-sm">Invitation Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={invitationLink}
                    readOnly
                    className="bg-background font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0"
                  >
                    {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  </Button>
                </div>
              </div>
            )}

        <DialogFooter>
          {!invitationLink
            ? (
                <>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? (
                          <>
                            <IconLoader2 size={16} className="mr-2 animate-spin" />
                            Creating...
                          </>
                        )
                      : (
                          'Create Invitation'
                        )}
                  </Button>
                </>
              )
            : (
                <></>
              )}
        </DialogFooter>
      </form>
    </Form>
  );
}
