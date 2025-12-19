import type { Icon } from '@tabler/icons-react';
import type { DifficultyOption, PriorityOption, StatusOption } from '@/lib/task/task-types';
import { IconArchive, IconArrowDown, IconArrowRight, IconArrowUp, IconBolt, IconCancel, IconCheckbox, IconCircle, IconCircleDashed, IconEyeCheck, IconHexagon, IconHourglassEmpty, IconSquare, IconTriangle } from '@tabler/icons-react';
import { taskDifficultyEnum, taskPriorityEnum, taskStatusEnum } from '@/schema';

const statusValues = taskStatusEnum.enumValues;
type StatusValue = (typeof statusValues)[number];

const priorityValues = taskPriorityEnum.enumValues;
type PriorityValue = (typeof priorityValues)[number];

const difficultyValues = taskDifficultyEnum.enumValues;
type DifficultyValue = (typeof difficultyValues)[number];

function buildOptions<T extends string, O extends { label: string; icon?: Icon; color?: string }>(
  values: readonly T[],
  configs: Readonly<Record<T, O>>,
  defaultIcon?: Icon,
): { value: T; label: string; icon: Icon; color: string }[] {
  return values.map((value) => {
    const config = configs[value];
    const label = config?.label ?? (value as unknown as string);
    const icon = (config?.icon ?? defaultIcon) as Icon;
    const color = config?.color ?? 'text-gray-600 dark:text-gray-400';

    return { value, label, icon, color };
  });
}

function buildDifficultyOptions(
  values: readonly DifficultyValue[],
  configs: Readonly<Record<DifficultyValue, { label: string; icon?: Icon; colors?: { background: string; foreground: string } }>>,
  defaultIcon?: Icon,
): { value: DifficultyValue; label: string; icon: Icon; colors?: { background: string; foreground: string } }[] {
  return values.map((value) => {
    const config = configs[value];
    const label = config?.label ?? (value as unknown as string);
    const icon = (config?.icon ?? defaultIcon) as Icon;
    const colors = config?.colors;

    return { value, label, icon, colors };
  });
}

const statusConfig: Record<StatusValue, { label: string; icon: Icon; color: string }> = {
  backlog: { label: 'Pending', icon: IconCircleDashed, color: 'text-gray-600 dark:text-gray-400' },
  todo: { label: 'To do', icon: IconCircle, color: 'text-blue-600 dark:text-blue-400' },
  in_progress: { label: 'In Progress', icon: IconHourglassEmpty, color: 'text-amber-600 dark:text-amber-400' },
  review: { label: 'Review', icon: IconEyeCheck, color: 'text-violet-600 dark:text-violet-400' },
  done: { label: 'Done', icon: IconCheckbox, color: 'text-emerald-600 dark:text-emerald-400' },
  canceled: { label: 'Canceled', icon: IconCancel, color: 'text-red-600 dark:text-red-400' },
  archived: { label: 'Archived', icon: IconArchive, color: 'text-gray-600 dark:text-gray-400' },
};
export const statuses: StatusOption[] = buildOptions(statusValues, statusConfig, IconCircle).filter(
  s => !['archived'].includes(s.value),
);
export const hiddenStatuses: StatusOption[] = buildOptions(statusValues, statusConfig, IconCircle).filter(
  s => ['archived'].includes(s.value),
);
export const allStatuses: StatusOption[] = buildOptions(statusValues, statusConfig, IconCircle);

const priorityConfig: Record<PriorityValue, { label: string; icon: Icon; color: string }> = {
  low: { label: 'Low', icon: IconArrowDown, color: 'bg-slate-500 dark:bg-slate-600' },
  medium: { label: 'Normal', icon: IconArrowRight, color: 'bg-blue-500 dark:bg-blue-600' },
  high: { label: 'High', icon: IconArrowUp, color: 'bg-amber-500 dark:bg-amber-600' },
  urgent: { label: 'Urgent', icon: IconBolt, color: 'bg-red-500 dark:bg-red-600' },
};
export const priorities: PriorityOption[] = buildOptions(priorityValues, priorityConfig, IconArrowRight);

const difficultyConfig: Record<DifficultyValue, { label: string; icon: Icon; colors?: { background: string; foreground: string } }> = {
  easy: { label: 'Easy', icon: IconTriangle, colors: { background: 'bg-green-600/10 dark:bg-green-400/10', foreground: 'text-green-600 dark:text-green-400' } },
  medium: { label: 'Medium', icon: IconSquare, colors: { background: 'bg-amber-600/10 dark:bg-amber-400/10', foreground: 'text-amber-600 dark:text-amber-400' } },
  hard: { label: 'Hard', icon: IconHexagon, colors: { background: 'bg-red-600/10 dark:bg-red-400/10', foreground: 'text-red-600 dark:text-red-400' } },
};
export const difficulties: DifficultyOption[] = buildDifficultyOptions(difficultyValues, difficultyConfig, IconCircle);
