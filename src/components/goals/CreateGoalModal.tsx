'use client';

import type * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCheck, IconSelector } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils';
import { TeamGoalValidation } from '@/validations/TeamGoalValidation';

type FormData = z.infer<typeof TeamGoalValidation>;

type Member = {
  id: string;
  name: string;
  email: string;
};

type Task = {
  id: string;
  name: string;
  assignees?: Array<{ id: string; name: string }>;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: FormData) => void;
  tasks?: Task[];
  members?: Member[];
};

const defaultMembers: Member[] = [];
const defaultTasks: Task[] = [];

export function CreateGoalModal({ open, onOpenChange, onCreate, tasks = defaultTasks, members = defaultMembers }: Props) {
  const [loading, setLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(TeamGoalValidation),
    defaultValues: {
      title: '',
      pointsReward: '',
      description: '',
      dueDate: '',
      assigneeIds: [],
      taskIds: [],
    },
  });

  const submit = (values: FormData) => {
    setLoading(true);
    try {
      onCreate(values);
      toast.success('Goal created');
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const selectedAssigneeIds = form.watch('assigneeIds') || [];
  const selectedAssignees = members.filter(member => selectedAssigneeIds.includes(member.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
          <DialogDescription>Enter the details to create a new goal</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="flex flex-1 flex-col gap-6 overflow-hidden" onSubmit={form.handleSubmit(submit)}>
            {/* Main content area */}
            <div className="flex flex-1 gap-6 overflow-hidden">
              {/* Left Column - Form Fields */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-4">
                {/* --- Title --- */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Launch Q4 campaign" {...field} />
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
                        <textarea
                          placeholder="Add details..."
                          className={cn(
                            'flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2',
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- Due Date --- */}
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (optional)</FormLabel>
                      <div className="flex gap-2">
                        <FormControl className="flex-1">
                          <Input type="date" {...field} />
                        </FormControl>
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => field.onChange('')}
                            className="px-2"
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- Points Reward --- */}
                <FormField
                  control={form.control}
                  name="pointsReward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points Reward</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- Assignee --- */}
                <FormField
                  control={form.control}
                  name="assigneeIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Assignees</FormLabel>
                      {members && members.length > 0
                        ? (
                            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      'w-full justify-between',
                                      selectedAssignees.length === 0 && 'text-muted-foreground',
                                    )}
                                  >
                                    {selectedAssignees.length > 0
                                      ? `${selectedAssignees.length} member${selectedAssignees.length === 1 ? '' : 's'} selected`
                                      : 'Select members...'}
                                    <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0">
                                <Command>
                                  <CommandInput placeholder="Search members..." />
                                  <CommandEmpty>No members found.</CommandEmpty>
                                  <CommandGroup>
                                    {members.map((member) => {
                                      const isSelected = selectedAssigneeIds.includes(member.id);
                                      return (
                                        <CommandItem
                                          key={member.id}
                                          value={`${member.name} ${member.email}`}
                                          onSelect={() => {
                                            // Multi-select - toggle selection
                                            const newSelection = isSelected
                                              ? selectedAssigneeIds.filter(id => id !== member.id)
                                              : [...selectedAssigneeIds, member.id];
                                            field.onChange(newSelection);
                                          }}
                                        >
                                          <IconCheck
                                            className={cn(
                                              'mr-2 h-4 w-4',
                                              isSelected
                                                ? 'opacity-100'
                                                : 'opacity-0',
                                            )}
                                          />
                                          {`${member.name} (${member.email})`}
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )
                        : (
                            <p className="text-sm text-muted-foreground">Loading members...</p>
                          )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Related Tasks */}
              <div className="flex w-72 flex-1 flex-col overflow-hidden border-l border-border pl-6">
                <FormField
                  control={form.control}
                  name="taskIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-1 flex-col overflow-hidden">
                      <FormLabel>Related Tasks</FormLabel>
                      <FormControl>
                        <div className="flex-1 space-y-2 overflow-y-auto rounded-md border border-input p-3">
                          {(!tasks || tasks.length === 0)
                            ? (
                                <p className="text-sm text-muted-foreground">No tasks available to associate.</p>
                              )
                            : (
                                tasks.map((task) => {
                                  const isChecked = (field.value || []).includes(task.id);
                                  const taskAssigneeIds = task.assignees?.map(a => a.id) || [];
                                  const goalAssigneeIds = selectedAssigneeIds || [];
                                  const isTaskCompatible = goalAssigneeIds.length === 0 || goalAssigneeIds.some(id => taskAssigneeIds.includes(id));

                                  return (
                                    <div key={task.id} className="flex flex-col gap-1.5">
                                      <label className={`flex cursor-pointer items-center gap-2 rounded p-2 transition-colors hover:bg-accent ${
                                        !isTaskCompatible && isChecked ? 'bg-yellow-50 dark:bg-yellow-950' : ''
                                      }`}>
                                        <input
                                          type="checkbox"
                                          value={task.id}
                                          checked={isChecked}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            const current = field.value || [];
                                            const next = checked ? [...current, task.id] : current.filter((id: string) => id !== task.id);
                                            field.onChange(next);
                                          }}
                                          className="cursor-pointer"
                                        />
                                        <span className="line-clamp-2 flex-1 text-sm">{task.name}</span>
                                      </label>
                                      {/* Task Assignees */}
                                      {task.assignees && task.assignees.length > 0 && (
                                        <div className="ml-6 flex flex-col gap-1">
                                          <div className="flex items-center gap-1">
                                            {task.assignees.map(assignee => (
                                              <Avatar key={assignee.id} className={`h-5 w-5 border border-background ${
                                                goalAssigneeIds.includes(assignee.id) ? 'ring-2 ring-green-500' : ''
                                              }`}>
                                                <AvatarFallback className="text-xs">
                                                  {getInitials(assignee.name)}
                                                </AvatarFallback>
                                              </Avatar>
                                            ))}
                                          </div>
                                          {isChecked && !isTaskCompatible && (
                                            <span className="text-xs text-yellow-700 dark:text-yellow-400">
                                              ⚠ No goal members are assigned to this task
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateGoalModal;
