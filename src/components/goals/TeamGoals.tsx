'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { IconGripVertical } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { updateGoal } from '@/app/(main)/dashboard/edit-goal-actions';
import { EditGoalModal } from '@/components/goals/EditGoalModal';
import { SortableGoalCard } from '@/components/goals/sortable-goal-card';
import { Button } from '@/components/ui/button';

type Goal = {
  id: string;
  name: string;
  description?: string;
  points?: number;
  dueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  taskIds?: string[];
  tasks?: {
    id: string;
    name: string;
    completed?: boolean;
    isPersonal?: boolean;
    assignees?: Array<{ id: string; name: string }>;
  }[];
  totalTasks?: number;
  completedTeamTasks?: number;
  completedPersonalTasks?: number;
};

export default function TeamGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [tasks, setTasks] = useState<{ id: string; name: string }[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);

  useEffect(() => {
    async function fetchGoals() {
      try {
        setLoading(true);
        const res = await fetch('/api/goals');
        if (!res.ok) {
          console.error('Failed to fetch goals');
          return;
        }
        const data = await res.json();
        setGoals(data);
      } catch (e) {
        console.error('Failed to fetch goals:', e);
        toast.error('Failed to load goals');
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();

    // Listen for newly created or deleted goals so we can refresh immediately
    function onCreated(e: any) {
      // If event carries detail we'll prepend it, otherwise refetch
      const g = e?.detail;
      if (g) {
        setGoals(s => [g, ...s]);
      } else {
        fetchGoals();
      }
    }

    function onDeleted(e: any) {
      const id = e?.detail?.id || e?.detail;
      if (id) {
        setGoals(s => s.filter(g => g.id !== id));
      } else {
        fetchGoals();
      }
    }

    const handleCreated = onCreated as EventListener;
    const handleDeleted = onDeleted as EventListener;

    window.addEventListener('goal-created', handleCreated);
    window.addEventListener('goal-deleted', handleDeleted);

    return () => {
      window.removeEventListener('goal-created', handleCreated);
      window.removeEventListener('goal-deleted', handleDeleted);
    };
  }, []);

  function handleDelete(id: string) {
    (async () => {
      try {
        const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          toast.error('Failed to delete goal');
          return;
        }
        setGoals(s => s.filter(g => g.id !== id));
        // notify other listeners
        try {
          window.dispatchEvent(new CustomEvent('goal-deleted', { detail: { id } }));
        } catch {}
        toast.success('Goal deleted');
      } catch (e) {
        console.error('Failed to delete goal', e);
        toast.error('Failed to delete goal');
      }
    })();
  }

  function handleEditClick(goal: Goal) {
    setEditingGoal(goal);
    // Fetch tasks and members
    Promise.all([
      fetch('/api/tasks').then(r => r.json()),
      fetch('/api/members').then(r => r.json()),
    ]).then(([tasksData, membersData]) => {
      setTasks(tasksData);
      setMembers(membersData);
      setEditOpen(true);
    });
  }

  async function handleEditSave(values: any) {
    if (!editingGoal) {
      return;
    }
    try {
      const result = await updateGoal(editingGoal.id, {
        title: values.title,
        description: values.description,
        pointsReward: values.pointsReward,
        dueDate: values.dueDate,
        assigneeIds: values.assigneeIds,
        taskIds: values.taskIds,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      // Refetch goals to get updated progress data and assignee info
      const res = await fetch('/api/goals');
      const updatedGoals = await res.json();
      setGoals(updatedGoals);

      toast.success('Goal updated');
      setEditOpen(false);
      setEditingGoal(null);
    } catch (e) {
      console.error('Failed to update goal', e);
      toast.error('Failed to update goal');
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex(goal => goal.id === active.id);
      const newIndex = goals.findIndex(goal => goal.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(goals, oldIndex, newIndex);
        setGoals(newOrder);
      }
    }
  }

  const goalsIds = goals.map(goal => goal.id);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Loading goals...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="mx-auto w-full max-w-7xl px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Goals</h2>
          <Button
            variant={isDraggingEnabled ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsDraggingEnabled(!isDraggingEnabled)}
            className="gap-2"
          >
            <IconGripVertical size={18} />
            {isDraggingEnabled ? 'Lock Order' : 'Reorder'}
          </Button>
        </div>

        {isDraggingEnabled
          ? (
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={goalsIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {goals.length === 0
                      ? (
                          <div className="rounded-lg border border-dashed p-8 text-center">
                            <p className="text-muted-foreground">No active goals yet.</p>
                          </div>
                        )
                      : (
                          goals.map(goal => (
                            <SortableGoalCard
                              key={goal.id}
                              goal={goal}
                              onDelete={handleDelete}
                              onEdit={handleEditClick}
                              isDraggingEnabled={isDraggingEnabled}
                            />
                          ))
                        )}
                  </div>
                </SortableContext>
              </DndContext>
            )
          : (
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {goals.length === 0
                  ? (
                      <div className="rounded-lg border border-dashed p-8 text-center">
                        <p className="text-muted-foreground">No active goals yet.</p>
                      </div>
                    )
                  : (
                      goals.map(goal => (
                        <SortableGoalCard
                          key={goal.id}
                          goal={goal}
                          onDelete={handleDelete}
                          onEdit={handleEditClick}
                          isDraggingEnabled={isDraggingEnabled}
                        />
                      ))
                    )}
              </div>
            )}
      </div>

      {/* Edit Goal Modal */}
      {editingGoal && (
        <EditGoalModal
          open={editOpen}
          onOpenChange={setEditOpen}
          goal={editingGoal}
          tasks={tasks}
          members={members}
          onSave={handleEditSave}
        />
      )}
    </section>
  );
}
