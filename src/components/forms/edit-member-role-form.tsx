'use client';

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import { useEffect, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { client } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { UpdateMemberRoleValidation } from '@/validations/OrganizationValidation';

type FormData = z.infer<typeof UpdateMemberRoleValidation>;

type EditRoleFormProps = React.ComponentProps<'form'> & {
  onSuccess?: () => void;
  userRole?: string | undefined;
  memberId?: string;
};

export function EditRoleForm({ userRole, className, onSuccess, memberId, ...props }: EditRoleFormProps) {
  const isValidRole = (role: string | undefined): role is 'admin' | 'member' | 'owner' => {
    return role === 'admin' || role === 'member' || role === 'owner';
  };

  const [loading, startTransition] = useTransition();
  const { data: session } = client.useSession();

  const form = useForm<FormData>({
    resolver: zodResolver(UpdateMemberRoleValidation),
    defaultValues: {
      role: isValidRole(userRole) ? userRole : 'member',
    },
  });

  useEffect(() => {
    if (userRole) {
      form.reset({
        role: isValidRole(userRole) ? userRole : 'member',
      });
    }
  }, [userRole, form]);

  const currentRole = useWatch({
    control: form.control,
    name: 'role',
  });

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      try {
        const activeOrgId = session?.session.activeOrganizationId;

        if (!activeOrgId) {
          toast.error('No active organization. Please create or select an organization first.');
          return;
        }

        if (!memberId) {
          toast.error('No member selected for role update.');
          return;
        }

        const { error } = await client.organization.updateMemberRole({
          memberId,
          role: values.role,
          organizationId: activeOrgId,
        });

        if (error) {
          toast.error(error.message || 'Failed to update role');
          return;
        }

        toast.success(`Role updated to ${values.role} successfully!`);
        onSuccess?.();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update role');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn('grid gap-6', className)} {...props}>
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="flex items-start justify-between">
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          {userRole !== currentRole && (
            <Button type="submit" disabled={loading}>
              {loading
                ? (
                    <>
                      <IconLoader2 size={16} className="mr-2 animate-spin" />
                      Updating Role...
                    </>
                  )
                : (
                    'Save Changes'
                  )}
            </Button>
          )}
        </DialogFooter>
      </form>
    </Form>
  );
}
