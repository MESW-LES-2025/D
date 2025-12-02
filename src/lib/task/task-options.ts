import type { Icon } from '@tabler/icons-react';
import type { DifficultyOption, PriorityOption, StatusOption } from '@/lib/task/task-types';
import { IconArchive, IconArrowDown, IconArrowRight, IconArrowUp, IconBolt, IconCancel, IconCheckbox, IconCircle, IconCircleDashed, IconEyeCheck, IconHourglassEmpty } from '@tabler/icons-react';
import { taskDifficultyEnum, taskPriorityEnum, taskStatusEnum } from '@/schema';

const statusValues = taskStatusEnum.enumValues;
type StatusValue = (typeof statusValues)[number];

const priorityValues = taskPriorityEnum.enumValues;
type PriorityValue = (typeof priorityValues)[number];

const difficultyValues = taskDifficultyEnum.enumValues;
type DifficultyValue = (typeof difficultyValues)[number];

function buildOptions<T extends string, O extends { label: string; icon?: Icon }>(
  values: readonly T[],
  configs: Readonly<Record<T, O>>,
  defaultIcon?: Icon,
): { value: T; label: string; icon: Icon }[] {
  return values.map((value) => {
    const config = configs[value];
    const label = config?.label ?? (value as unknown as string);
    const icon = (config?.icon ?? defaultIcon) as Icon;

    return { value, label, icon };
  });
}

const statusConfig: Record<StatusValue, { label: string; icon: Icon }> = {
  backlog: { label: 'Backlog', icon: IconCircleDashed },
  todo: { label: 'Todo', icon: IconCircle },
  in_progress: { label: 'In Progress', icon: IconHourglassEmpty },
  review: { label: 'Review', icon: IconEyeCheck },
  done: { label: 'Done', icon: IconCheckbox },
  archived: { label: 'Archived', icon: IconArchive },
  canceled: { label: 'Canceled', icon: IconCancel },
};

export const statuses: StatusOption[] = buildOptions(statusValues, statusConfig, IconCircle);

const priorityConfig: Record<PriorityValue, { label: string; icon: Icon }> = {
  low: { label: 'Low', icon: IconArrowDown },
  medium: { label: 'Medium', icon: IconArrowRight },
  high: { label: 'High', icon: IconArrowUp },
  urgent: { label: 'Urgent', icon: IconBolt },
};

export const priorities: PriorityOption[] = buildOptions(priorityValues, priorityConfig, IconArrowRight);

const difficultyConfig: Record<DifficultyValue, { label: string }> = {
  easy: { label: 'Easy' },
  medium: { label: 'Medium' },
  hard: { label: 'Hard' },
};

export const difficulties: DifficultyOption[] = (difficultyValues as readonly DifficultyValue[]).map(value => ({
  value,
  label: difficultyConfig[value]?.label ?? (value as unknown as string),
}));
