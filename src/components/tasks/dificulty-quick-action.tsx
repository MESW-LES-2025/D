'use client';

import type { Difficulty, DifficultyOption } from '@/lib/task/task-types';
import { useOptimistic, useTransition } from 'react';
import { toast } from 'sonner';
import { updateTaskDifficulty } from '@/components/tasks/dificulty-quick-action.action';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { difficulties } from '@/lib/task/task-options';

type DifficultyQuickActionProps = {
  difficulty: DifficultyOption | undefined;
  taskId: string;
};

export function DifficultyQuickAction({ difficulty, taskId }: DifficultyQuickActionProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticDifficulty, setOptimisticDifficulty] = useOptimistic(
    difficulty?.value ?? '',
    (_state, newDifficulty: Difficulty) => newDifficulty,
  );

  if (!difficulty) {
    return null;
  }

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    startTransition(async () => {
      setOptimisticDifficulty(newDifficulty);
      const result = await updateTaskDifficulty(taskId, newDifficulty);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Difficulty updated successfully!');
    });
  };

  const currentDifficulty = difficulties.find(d => d.value === optimisticDifficulty) ?? difficulty;

  return (
    <Select value={optimisticDifficulty} onValueChange={handleDifficultyChange} disabled={isPending}>
      <SelectTrigger
        className="h-auto! border-none p-0 hover:cursor-pointer dark:bg-transparent hover:dark:bg-transparent"
        chevronClassName="opacity-0 group-hover:opacity-50 group-focus-visible:opacity-100 transition-opacity"
      >
        <SelectValue>
          <span className="inline-flex items-center gap-1">
            {currentDifficulty.icon && <currentDifficulty.icon className="size-4" />}
            <span>{currentDifficulty.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {difficulties.map(difficultyOption => (
            <SelectItem key={difficultyOption.value} value={difficultyOption.value}>
              <span className="inline-flex items-center gap-1">
                {difficultyOption.icon && <difficultyOption.icon className="size-4" />}
                <span>{difficultyOption.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
