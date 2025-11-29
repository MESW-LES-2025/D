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
import { cn } from '@/lib/utils';
import { TeamGoalValidation } from '@/validations/TeamGoalValidation';

type FormData = z.infer<typeof TeamGoalValidation>;

type Member = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: FormData) => void;
  tasks?: { id: string; name: string }[];
  members?: Member[];
};

const defaultMembers: Member[] = [];
const defaultTasks: { id: string; name: string }[] = [];

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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
          <DialogDescription>Enter the details to create a new goal</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
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
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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

            {/* --- Assignees --- */}
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
                                  ? `${selectedAssignees.length} member${selectedAssignees.length > 1 ? 's' : ''} selected`
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
                                        const newValue = isSelected
                                          ? selectedAssigneeIds.filter(id => id !== member.id)
                                          : [...selectedAssigneeIds, member.id];
                                        field.onChange(newValue);
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

            {/* --- Related Tasks --- */}
            <FormField
              control={form.control}
              name="taskIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Related Tasks</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {(!tasks || tasks.length === 0)
                        ? (
                            <p className="text-sm text-muted-foreground">No tasks available to associate.</p>
                          )
                        : (
                            tasks.map((task) => {
                              const isChecked = (field.value || []).includes(task.id);
                              return (
                                <label key={task.id} className="flex items-center gap-2">
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
                                  />
                                  <span className="text-sm">{task.name}</span>
                                </label>
                              );
                            })
                          )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
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
