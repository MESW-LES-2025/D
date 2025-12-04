import type { Icon } from '@tabler/icons-react';
import type { DifficultyOption, PriorityOption, StatusOption } from '@/lib/task/task-types';
import { IconArchive, IconArrowDown, IconArrowRight, IconArrowUp, IconBolt, IconCancel, IconCheckbox, IconCircle, IconCircleDashed, IconEyeCheck, IconHexagon, IconHourglassEmpty, IconSquare, IconTrash, IconTriangle } from '@tabler/icons-react';
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
  backlog: { label: 'Pending', icon: IconCircleDashed },
  todo: { label: 'To do', icon: IconCircle },
  in_progress: { label: 'In Progress', icon: IconHourglassEmpty },
  review: { label: 'Review', icon: IconEyeCheck },
  done: { label: 'Done', icon: IconCheckbox },
  canceled: { label: 'Canceled', icon: IconCancel },
  archived: { label: 'Archived', icon: IconArchive },
  deleted: { label: 'Deleted', icon: IconTrash },
};
export const statuses: StatusOption[] = buildOptions(statusValues, statusConfig, IconCircle).filter(
  s => !['archived', 'deleted'].includes(s.value),
);
export const hiddenStatuses: StatusOption[] = buildOptions(statusValues, statusConfig, IconCircle).filter(
  s => ['archived', 'deleted'].includes(s.value),
);
export const allStatuses: StatusOption[] = buildOptions(statusValues, statusConfig, IconCircle);

const priorityConfig: Record<PriorityValue, { label: string; icon: Icon }> = {
  low: { label: 'Low', icon: IconArrowDown },
  medium: { label: 'Medium', icon: IconArrowRight },
  high: { label: 'High', icon: IconArrowUp },
  urgent: { label: 'Urgent', icon: IconBolt },
};
export const priorities: PriorityOption[] = buildOptions(priorityValues, priorityConfig, IconArrowRight);

const difficultyConfig: Record<DifficultyValue, { label: string; icon: Icon }> = {
  easy: { label: 'Easy', icon: IconTriangle },
  medium: { label: 'Medium', icon: IconSquare },
  hard: { label: 'Hard', icon: IconHexagon },
};
export const difficulties: DifficultyOption[] = buildOptions(difficultyValues, difficultyConfig, IconCircle);
