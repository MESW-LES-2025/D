'use client';
import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCheck, IconSelector } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createTask } from '@/app/(main)/dashboard/actions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { TaskValidation } from '@/validations/TaskValidation';

type FormData = z.infer<typeof TaskValidation>;

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
};

export function CreateTaskModal({ open, onOpenChange, users }: Props) {
  const [loading, startTransition] = useTransition();
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(TaskValidation),
    defaultValues: {
      name: '',
      description: '',
      priority: 'medium',
      difficulty: 'medium',
      dueDate: undefined,
      assigneeIds: [],
    },
  });

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      const result = await createTask(values);

      if (result.error) {
        toast.error(result.error || 'Something went wrong');
        return;
      }

      const scoreMap = {
        easy: '10',
        medium: '20',
        hard: '30',
      } as const;
      const score = scoreMap[values.difficulty];

      toast.success('Task created successfully!', {
        description: `${values.name} has been created with ${values.difficulty} difficulty (${score} points)`,
      });

      form.reset();
      onOpenChange(false);
    });
  };

  const selectedUserIds = form.watch('assigneeIds') || [];
  const selectedUsers = users.filter(user => selectedUserIds.includes(user.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new task</DialogTitle>
          <DialogDescription>
            Enter the details to create a new task
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            {/* --- Name --- */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Task name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Priority --- */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- Difficulty --- */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy (1x points)</SelectItem>
                      <SelectItem value="medium">Medium (2x points)</SelectItem>
                      <SelectItem value="hard">Hard (3x points)</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={new Date().toISOString().substring(0, 10)}
                      value={
                        field.value
                          ? new Date(field.value)
                              .toISOString()
                              .substring(0, 10)
                          : ''
                      }
                      onChange={(e) => {
                        field.onChange(
                          e.target.value
                            ? new Date(e.target.value)
                            : undefined,
                        );
                      }}
                    />
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
                  <FormLabel>Assignees (optional)</FormLabel>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'w-full justify-between',
                            selectedUsers.length === 0 && 'text-muted-foreground',
                          )}
                        >
                          {selectedUsers.length > 0
                            ? `${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} selected`
                            : 'Select users...'}
                          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => {
                            const isSelected = selectedUserIds.includes(user.id);
                            return (
                              <CommandItem
                                key={user.id}
                                value={`${user.name} ${user.email}`}
                                onSelect={() => {
                                  const newValue = isSelected
                                    ? selectedUserIds.filter(id => id !== user.id)
                                    : [...selectedUserIds, user.id];
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
                                {`${user.name} (${user.email})`}
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

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
