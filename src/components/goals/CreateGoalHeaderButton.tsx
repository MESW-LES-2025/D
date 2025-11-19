'use client';

import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateGoalModal } from './CreateGoalModal';

type GoalValues = any;

const STORAGE_KEY = 'team_goals_v1';

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function CreateGoalHeaderButton() {
  const [open, setOpen] = useState(false);

  async function handleCreate(values: GoalValues) {
    const goal = {
      id: makeId(),
      title: values.title?.trim() ?? 'Untitled',
      reward: values.reward?.trim(),
      description: values.description?.trim(),
      target: values.target?.trim(),
      dueDate: values.dueDate,
      assignees: values.assignees
        ? values.assignees.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(goal);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

      // Notify other components in this window
      window.dispatchEvent(new CustomEvent('goal-created', { detail: goal }));
    } catch (e) {
      console.error('Failed to save goal', e);
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <IconPlus className="h-4 w-4" />
        Add Goal
      </Button>
      <CreateGoalModal
        open={open}
        onOpenChange={setOpen}
        onCreate={async (v) => {
          await handleCreate(v);
          setOpen(false);
        }}
      />
    </>
  );
}

export default CreateGoalHeaderButton;
