'use client';

import type { ColumnDef } from '@tanstack/react-table';

import type { DifficultyOption, PriorityOption, StatusOption, Task } from '@/lib/task/task-types';
import { DataTableColumnHeader } from '@/components/tasks/table/data-table-column-header';
import { DataTableRowActions } from '@/components/tasks/table/data-table-row-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup, AvatarGroupTooltip } from '@/components/ui/avatar-group';
import { Checkbox } from '@/components/ui/checkbox';
import { difficulties, priorities, statuses } from '@/lib/task/task-options';
import { getInitials } from '@/lib/utils';

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
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex gap-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('title')}
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
      const status: StatusOption | undefined = statuses.find(
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
      const priority: PriorityOption | undefined = priorities.find(
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
      const difficulty: DifficultyOption | undefined = difficulties.find(
        difficulty => difficulty.value === row.getValue('difficulty'),
      );

      if (!difficulty) {
        return null;
      }

      return (
        <div className="flex items-center gap-2">
          {difficulty.icon && (
            <difficulty.icon className="size-4 text-muted-foreground" />
          )}
          <span>{difficulty.label}</span>
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
              <Avatar key={assignee.id} className="border-3 border-transparent">
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
    filterFn: (row, _id, value) => {
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
