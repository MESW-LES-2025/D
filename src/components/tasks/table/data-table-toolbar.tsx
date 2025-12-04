'use client';

import type { Table } from '@tanstack/react-table';

import { IconUserCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { DataTableFacetedFilter } from '@/components/tasks/table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/tasks/table/data-table-view-options';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { difficulties, priorities, statuses } from '@/lib/task/task-options';
import { cn } from '@/lib/utils';

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
};

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [assignedToMe, setAssignedToMe] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filter tasks..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={event =>
            table.getColumn('title')?.setFilterValue(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title="Priority"
            options={priorities}
          />
        )}
        {table.getColumn('difficulty') && (
          <DataTableFacetedFilter
            column={table.getColumn('difficulty')}
            title="Difficulty"
            options={difficulties}
          />
        )}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 border-dashed',
            assignedToMe && 'border-solid bg-accent',
          )}
          onClick={() => {
            setAssignedToMe(!assignedToMe);
            table.getColumn('assignees')?.setFilterValue(!assignedToMe ? true : undefined);
          }}
        >
          <IconUserCheck />
          My Tasks
        </Button>
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              setAssignedToMe(false);
            }}
          >
            Reset
            <IconX />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
