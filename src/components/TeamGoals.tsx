'use client';

import { IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

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

export default function TeamGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setGoals(JSON.parse(raw));
      }
    } catch {
      toast.error('Failed to load goals');
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch {
      toast.error('Failed to save goals');
    }
  }, [goals]);

  function handleDelete(id: string) {
    setGoals(s => s.filter(g => g.id !== id));
    toast.success('Goal deleted');
  }

  // listen for header-created goals
  useEffect(() => {
    function onCreated(e: any) {
      const goal = e?.detail;
      if (goal) {
        setGoals(s => [goal, ...s]);
      }
    }

    window.addEventListener('goal-created', onCreated as EventListener);
    return () => window.removeEventListener('goal-created', onCreated as EventListener);
  }, []);

  return (
    <section className="space-y-6">

      <div className="space-y-4">
        {goals.length === 0
          ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-muted-foreground">No active goals yet.</p>
              </div>
            )
          : (
              <div className="space-y-3">
                {goals.map(goal => (
                  <div
                    key={goal.id}
                    className="space-y-3 rounded-lg border border-input bg-card p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold">{goal.title}</h4>
                        {goal.reward && (
                          <p className="mt-1 text-sm text-green-600 dark:text-green-500">
                            🎁 Reward:
                            {goal.reward}
                          </p>
                        )}
                        {goal.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {goal.target && (
                        <span className="rounded bg-secondary px-2 py-1">
                          Target:
                          {goal.target}
                        </span>
                      )}
                      {goal.dueDate && (
                        <span className="rounded bg-secondary px-2 py-1">
                          Due:
                          {new Date(goal.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {goal.assignees && goal.assignees.length > 0 && (
                        <span className="rounded bg-secondary px-2 py-1">
                          Assignees:
                          {goal.assignees.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(goal.id)}>
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
