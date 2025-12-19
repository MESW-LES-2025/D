'use client';

import type * as z from 'zod';
import type { Task } from '@/lib/task/task-types';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCalendar, IconLoader2, IconSearch, IconTarget } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { createGoal } from '@/lib/goals/actions/create-goal';
import { allStatuses, difficulties, priorities } from '@/lib/task/task-options';
import { cn } from '@/lib/utils';
import { CreateGoalValidation } from '@/validations/GoalValidation';

type FormData = z.infer<typeof CreateGoalValidation>;

type CreateGoalFormProps = React.ComponentProps<'form'> & {
  onSuccess?: () => void;
};

export function CreateGoalForm({ className, onSuccess, ...props }: CreateGoalFormProps) {
  const [loading, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(CreateGoalValidation),
    defaultValues: {
      name: '',
      description: '',
      points: 100,
      dueDate: undefined,
      taskIds: [],
    },
  });

  const selectedTaskIds = form.watch('taskIds') || [];

  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoadingTasks(true);
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          toast.error('Failed to load tasks');
          return;
        }
        const data = await response.json();
        setAvailableTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast.error('Failed to load tasks');
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks based on search
  const filteredTasks = availableTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const onSubmit = (values: FormData) => {
    startTransition(async () => {
      try {
        const result = await createGoal(values);

        if (!result.success) {
          toast.error(result.error || 'Failed to create goal');
          return;
        }

        toast.success('Goal created successfully');
        form.reset();
        onSuccess?.();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to create goal');
      }
    });
  };

  const toggleTask = (taskId: string) => {
    const currentIds = selectedTaskIds;
    const newIds = currentIds.includes(taskId)
      ? currentIds.filter(id => id !== taskId)
      : [...currentIds, taskId];
    form.setValue('taskIds', newIds);
  };

  return (
    <Form {...form}>
      <form id="goal-form" onSubmit={form.handleSubmit(onSubmit)} className={cn('flex gap-4', className)} {...props}>
        {/* Left side - Form fields */}
        <div className="flex flex-1 flex-col space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Complete 50 tasks this month"
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="gap-1">
                  Description
                  {' '}
                  <span className="text-muted-foreground">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a description..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconTarget className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="100"
                        className="bg-background pl-10"
                        step={100}
                        {...field}
                        onChange={e => field.onChange(Number.parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                  </FormControl>
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
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={date => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
        </div>

        {/* Right side - Task selection */}
        <div className="w-1/2 space-y-4 border-l pl-4">
          <div className="grid gap-2">
            <Label>
              Select Tasks
              {' '}
              <span className="text-muted-foreground">
                (
                {selectedTaskIds.length}
                {' '}
                selected)
              </span>
            </Label>

            {/* Search */}
            <div className="relative">
              <IconSearch className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Task list */}
          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {loadingTasks
                ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      Loading tasks...
                    </p>
                  )
                : filteredTasks.length === 0
                  ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No tasks found
                      </p>
                    )
                  : (
                      filteredTasks.map(task => (
                        <Label
                          key={task.id}
                          className="flex items-start gap-3 rounded-lg border p-3 hover:bg-accent/50 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950"
                        >
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={selectedTaskIds.includes(task.id)}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                          />
                          <div className="grid gap-2">
                            <p className="text-[15px] leading-none font-medium">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-1">
                              {(() => {
                                const statusOption = allStatuses.find(s => s.value === task.status);
                                const priorityOption = priorities.find(p => p.value === task.priority);
                                const difficultyOption = difficulties.find(d => d.value === task.difficulty);

                                return (
                                  <>
                                    {statusOption && (
                                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                        <statusOption.icon size={12} />
                                        {statusOption.label}
                                      </Badge>
                                    )}
                                    {priorityOption && (
                                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                        <priorityOption.icon size={12} />
                                        {priorityOption.label}
                                      </Badge>
                                    )}
                                    {difficultyOption && (
                                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                        <difficultyOption.icon size={12} />
                                        {difficultyOption.label}
                                      </Badge>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </Label>
                      ))
                    )}
            </div>
          </ScrollArea>
        </div>
      </form>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline" type="button" disabled={loading}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" form="goal-form" disabled={loading}>
          {loading
            ? (
                <>
                  <IconLoader2 size={16} className="mr-2 animate-spin" />
                  Creating...
                </>
              )
            : (
                'Create Goal'
              )}
        </Button>
      </DialogFooter>
    </Form>
  );
}
