import type { Icon } from '@tabler/icons-react';
import type { User } from 'better-auth';
import type { InferSelectModel } from 'drizzle-orm';
import type { taskDifficultyEnum, taskPriorityEnum, taskStatusEnum, taskTable } from '@/schema';

export type Task = InferSelectModel<typeof taskTable>;

export type TaskWithAssignees = Task & {
  assignees: User[];
};

export type Status = typeof taskStatusEnum.enumValues[number];
export type Priority = typeof taskPriorityEnum.enumValues[number];
export type Difficulty = typeof taskDifficultyEnum.enumValues[number];

export type StatusOption = {
  value: string;
  label: string;
  icon: Icon;
};

export type PriorityOption = {
  value: string;
  label: string;
  icon: Icon;
};

export type DifficultyOption = {
  value: string;
  label: string;
  icon: Icon;
};
