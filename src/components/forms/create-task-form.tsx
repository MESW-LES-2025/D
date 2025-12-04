'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCalendar, IconCheck, IconLoader2, IconSelector } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { client as authClient } from '@/lib/auth/auth-client';
import { difficulties, priorities, statuses } from '@/lib/task/task-options';
import { cn } from '@/lib/utils';
import { TaskValidation } from '@/validations/TaskValidation';

type FormData = z.infer<typeof TaskValidation>;

type OrganizationMember = {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
};

type TaskFormProps = {
  onSubmit: (values: FormData) => void;
  onCancel?: () => void;
  loading?: boolean;
  defaultValues?: Partial<FormData>;
};

export function TaskForm({
  onSubmit,
  onCancel,
  loading = false,
  defaultValues,
}: TaskFormProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [membersFetched, setMembersFetched] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(TaskValidation),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      status: defaultValues?.status ?? 'backlog',
      priority: defaultValues?.priority ?? 'medium',
      difficulty: defaultValues?.difficulty ?? 'medium',
      dueDate: defaultValues?.dueDate ?? undefined,
      assigneeIds: defaultValues?.assigneeIds ?? [],
    },
  });

  const fetchMembers = async () => {
    if (membersFetched) {
      return;
    }

    setLoadingMembers(true);
    try {
      const { data, error } = await authClient.organization.listMembers({
        query: {
          limit: 100,
          sortBy: 'createdAt',
          sortDirection: 'asc',
        },
      });

      if (error) {
        console.error('Error fetching members:', error);
        return;
      }

      if (data?.members) {
        setMembers(data.members as OrganizationMember[]);
        setMembersFetched(true);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const selectedUserIds = form.watch('assigneeIds') || [];
  const selectedMembers = members.filter(member =>
    selectedUserIds.includes(member.userId),
  );

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {/* --- Title --- */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Description --- */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a description..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Status & Priority (Row) --- */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map((status) => {
                      const Icon = status.icon;
                      return (
                        <SelectItem key={status.value} value={status.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {status.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorities.map((priority) => {
                      const Icon = priority.icon;
                      return (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {priority.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Difficulty & Due Date (Row) --- */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {difficulties.map((difficulty) => {
                      const Icon = difficulty.icon;
                      return (
                        <SelectItem
                          key={difficulty.value}
                          value={difficulty.value}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {difficulty.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground',
                        )}
                      >
                        {field.value
                          ? (
                              format(field.value, 'PPP')
                            )
                          : (
                              <span>Pick a date</span>
                            )}
                        <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={date =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))}
                      captionLayout="dropdown"
                      startMonth={new Date(new Date().getFullYear(), 0)}
                      endMonth={new Date(new Date().getFullYear() + 10, 0)}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- Assignees --- */}
        <FormField
          control={form.control}
          name="assigneeIds"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Assignees (optional)</FormLabel>
              <Popover
                open={comboboxOpen}
                onOpenChange={(open) => {
                  setComboboxOpen(open);
                  if (open) {
                    fetchMembers();
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-full justify-between',
                        selectedMembers.length === 0 && 'text-muted-foreground',
                      )}
                    >
                      {selectedMembers.length > 0
                        ? `${selectedMembers.length} user${selectedMembers.length > 1 ? 's' : ''} selected`
                        : 'Select users...'}
                      <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0"
                  align="start"
                  sideOffset={0}
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                >
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandEmpty>
                      {loadingMembers
                        ? (
                            <div className="flex items-center justify-center py-6">
                              <IconLoader2 className="h-4 w-4 animate-spin" />
                            </div>
                          )
                        : (
                            'No users found.'
                          )}
                    </CommandEmpty>
                    <CommandGroup>
                      {members.map((member) => {
                        const isSelected = selectedUserIds.includes(member.userId);
                        return (
                          <CommandItem
                            key={member.userId}
                            value={`${member.user.name} ${member.user.email}`}
                            onSelect={() => {
                              const newValue = isSelected
                                ? selectedUserIds.filter(
                                    id => id !== member.userId,
                                  )
                                : [...selectedUserIds, member.userId];
                              field.onChange(newValue);
                            }}
                          >
                            <IconCheck
                              className={cn(
                                'mr-2 h-4 w-4',
                                isSelected ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {`${member.user.name} (${member.user.email})`}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Actions --- */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
