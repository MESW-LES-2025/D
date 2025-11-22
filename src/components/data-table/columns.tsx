'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { InferSelectModel } from 'drizzle-orm';

import type { taskTable } from '@/schema/task';
import { IconArchive, IconArrowDown, IconArrowRight, IconArrowUp, IconBolt, IconCancel, IconCheckbox, IconCircle, IconCircleDashed, IconEyeCheck, IconHourglassEmpty } from '@tabler/icons-react';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup, AvatarGroupTooltip } from '@/components/ui/avatar-group';
import { Checkbox } from '@/components/ui/checkbox';
import { getInitials } from '@/lib/utils';
import { taskDifficultyEnum, taskPriorityEnum, taskStatusEnum } from '@/schema/task';

type Task = InferSelectModel<typeof taskTable>;

const statusValues = taskStatusEnum.enumValues;
const priorityValues = taskPriorityEnum.enumValues;
const difficultyValues = taskDifficultyEnum.enumValues;

export const statuses = statusValues.map((value) => {
  const configs: Record<string, { label: string; icon: typeof IconCircle }> = {
    backlog: { label: 'Backlog', icon: IconCircleDashed },
    todo: { label: 'Todo', icon: IconCircle },
    in_progress: { label: 'In Progress', icon: IconHourglassEmpty },
    review: { label: 'Review', icon: IconEyeCheck },
    done: { label: 'Done', icon: IconCheckbox },
    archived: { label: 'Archived', icon: IconArchive },
    canceled: { label: 'Canceled', icon: IconCancel },
  };

  const config = configs[value] || { label: value, icon: IconCircle };

  return {
    value,
    label: config.label,
    icon: config.icon,
  };
});

export const priorities = priorityValues.map((value) => {
  const configs: Record<string, { label: string; icon: typeof IconArrowDown }> = {
    low: { label: 'Low', icon: IconArrowDown },
    medium: { label: 'Medium', icon: IconArrowRight },
    high: { label: 'High', icon: IconArrowUp },
    urgent: { label: 'Urgent', icon: IconBolt },
  };

  const config = configs[value] || { label: value, icon: IconArrowRight };

  return {
    value,
    label: config.label,
    icon: config.icon,
  };
});

export const difficulties = difficultyValues.map((value) => {
  const configs: Record<string, { label: string }> = {
    easy: { label: 'Easy' },
    medium: { label: 'Medium' },
    hard: { label: 'Hard' },
  };

  const config = configs[value] || { label: value };

  return {
    value,
    label: config.label,
  };
});

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
          || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'tittle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('tittle')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = statuses.find(
        status => status.value === row.getValue('status'),
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[100px] items-center gap-2">
          {status.icon && (
            <status.icon className="size-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        priority => priority.value === row.getValue('priority'),
      );

      if (!priority) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          {priority.icon && (
            <priority.icon className="size-4 text-muted-foreground" />
          )}
          <span>{priority.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Difficulty" />
    ),
    cell: ({ row }) => {
      const difficulty = difficulties.find(
        difficulty => difficulty.value === row.getValue('difficulty'),
      );

      if (!difficulty) {
        return null;
      }

      return (
        <div className="flex items-center">
          <span>{difficulty.label}</span>
          <span className="ml-1 text-xs text-muted-foreground">
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'assignees',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assignees" />
    ),
    cell: ({ row }) => {
      const assignees = row.getValue('assignees') as Array<{ id: string; name: string; email: string; image?: string | null }> | undefined;

      if (!assignees || assignees.length === 0) {
        return <span className="text-muted-foreground">Unassigned</span>;
      }

      return (
        <AvatarGroup variant="motion" className="-space-x-3">
          {assignees.map((assignee) => {
            return (
              <Avatar key={assignee.id} className="border-3 border-background">
                {assignee.image && (
                  <AvatarImage src={assignee.image} alt={assignee.name} />
                )}
                <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                <AvatarGroupTooltip>
                  <p>{assignee.name}</p>
                </AvatarGroupTooltip>
              </Avatar>
            );
          })}
        </AvatarGroup>
      );
    },
    filterFn: (row, id, value) => {
      if (!value) {
        return true;
      }

      const assignees = row.getValue('assignees') as Array<{ id: string; name: string; email: string; isCurrentUser: boolean; image?: string | null }> | undefined;

      if (!assignees || assignees.length === 0) {
        return false;
      }

      return assignees.some(a => a.isCurrentUser);
    },
    enableSorting: false,
  },
  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due Date" />
    ),
    cell: ({ row }) => {
      const dueDate = row.getValue('dueDate');

      if (!dueDate) {
        return <span className="text-muted-foreground">No due date</span>;
      }

      const date = new Date(dueDate as string);
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return (
        <div className="flex items-center gap-2">
          <span>{formatted}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
