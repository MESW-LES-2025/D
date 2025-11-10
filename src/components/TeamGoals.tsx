'use client';

import type { TeamGoalFormData } from '@/validations/TeamGoalValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/common/logo';
import { TeamGoalValidation } from '@/validations/TeamGoalValidation';
import { cn } from '@/lib/utils';

type Goal = {
  id: string;
  title: string;
  reward?: string;
  description?: string;
  target?: string;
  dueDate?: string;
  assignees?: string[];
};

const STORAGE_KEY = 'team_goals_v1';

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function TeamGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TeamGoalFormData>({
    resolver: zodResolver(TeamGoalValidation),
    defaultValues: {
      title: '',
      reward: '',
      description: '',
      target: '',
      dueDate: '',
      assignees: '',
    },
  });

  // Load goals from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setGoals(JSON.parse(raw));
      }
    } catch (e) {
      toast.error('Failed to load goals');
    }
  }, []);

  // Persist goals to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      toast.error('Failed to save goals');
    }
  }, [goals]);

  function onSubmit(values: TeamGoalFormData) {
    setIsLoading(true);
    try {
      const goal: Goal = {
        id: makeId(),
        title: values.title.trim(),
        reward: values.reward?.trim(),
        description: values.description?.trim(),
        target: values.target?.trim(),
        dueDate: values.dueDate,
        assignees: values.assignees
          ? values.assignees
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
          : undefined,
      };

      setGoals((s) => [goal, ...s]);
      form.reset();
      toast.success('Goal created');
    } catch (e) {
      toast.error('Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  }

  function handleDelete(id: string) {
    setGoals((s) => s.filter((g) => g.id !== id));
    toast.success('Goal deleted');
  }

  return (
    <section aria-labelledby="team-goals-heading" className="space-y-8">
      <div className="flex items-center gap-4">
        <Logo size="md" showText={false} />
        <div>
          <h2 id="team-goals-heading" className="text-2xl font-bold">Team Goals</h2>
          <p className="text-sm text-muted-foreground">Create and manage your team goals in one place</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Launch Q4 marketing campaign"
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
            name="reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., $500 bonus or team lunch"
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
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Add more details about this goal..."
                    className={cn(
                      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 50% increase in leads"
                    className="bg-background"
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="assignees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignees (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., alice, bob, charlie"
                    className="bg-background"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              'Create Goal'
            )}
          </Button>
        </form>
      </Form>

      {/* Goals List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Goals ({goals.length})</h3>

        {goals.length === 0
          ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No goals yet. Create your first goal above!</p>
              </div>
            )
          : (
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-lg border border-input bg-card p-4 space-y-3 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{goal.title}</h4>
                        {goal.reward && (
                          <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                            🎁 Reward: {goal.reward}
                          </p>
                        )}
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {goal.target && (
                        <span className="px-2 py-1 bg-secondary rounded">
                          Target: {goal.target}
                        </span>
                      )}
                      {goal.dueDate && (
                        <span className="px-2 py-1 bg-secondary rounded">
                          Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {goal.assignees && goal.assignees.length > 0 && (
                        <span className="px-2 py-1 bg-secondary rounded">
                          Assignees: {goal.assignees.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>
    </section>
  );
}
