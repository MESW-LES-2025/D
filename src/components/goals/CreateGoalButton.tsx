'use client';

import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createGoal } from '@/app/(main)/dashboard/goal-actions';
import { Button } from '@/components/ui/button';
import { CreateGoalModal } from './CreateGoalModal';

type Props = {
  onCreate: (values: any) => void;
};

type Member = { id: string; name: string; email: string };

export function CreateGoalButton({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<{ id: string; name: string }[] | undefined>(undefined);
  const [members, setMembers] = useState<Member[] | undefined>(undefined);

  async function handleClick() {
    try {
      const [tasksRes, membersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/members'),
      ]);

      if (!tasksRes.ok || !membersRes.ok) {
        toast.error('Failed to load tasks or members');
        return;
      }

      const tasksData = await tasksRes.json();
      const membersData = await membersRes.json();

      if (!Array.isArray(tasksData) || tasksData.length === 0) {
        toast.error('To create a goal you need at least one task. Please create a task first.');
        return;
      }

      setTasks(tasksData);
      setMembers(membersData);
      setOpen(true);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load form data');
    }
  }

  async function handleCreate(values: any) {
    try {
      const result = await createGoal({
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

      toast.success('Goal created successfully!');
      // Refetch goals to get updated data with task completion status
      try {
        const goalsRes = await fetch('/api/goals');
        if (goalsRes.ok) {
          const updatedGoals = await goalsRes.json();
          // Dispatch event with full goal data
          const newGoal = updatedGoals.find((g: any) => result.data && g.id === result.data.id);
          if (newGoal) {
            window.dispatchEvent(new CustomEvent('goal-created', { detail: newGoal }));
          }
        }
      } catch {
        // Fallback: dispatch with basic data if refetch fails
        try {
          if (result.data) {
            const assigneeId = values.assigneeIds?.[0];
            const assignee = assigneeId ? members?.find(m => m.id === assigneeId) : null;

            const payload = {
              ...result.data,
              taskIds: values.taskIds || [],
              assigneeIds: values.assigneeIds || [],
              points: values.pointsReward ? Number.parseInt(values.pointsReward, 10) : 0,
              assigneeName: assignee?.name,
              assigneeEmail: assignee?.email,
              tasks: values.taskIds?.map((taskId: string) => {
                const task = tasks?.find(t => t.id === taskId);
                return { id: taskId, name: task?.name || '' };
              }) || [],
            };
            window.dispatchEvent(new CustomEvent('goal-created', { detail: payload }));
          }
        } catch {}
      }
      onCreate(result.data);
      setOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to create goal');
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => void handleClick()}>
        <IconPlus className="h-4 w-4" />
        Add Goal
      </Button>
      <CreateGoalModal open={open} onOpenChange={setOpen} onCreate={handleCreate} tasks={tasks} members={members} />
    </>
  );
}
