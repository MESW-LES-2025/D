'use client';

import type { Table } from '@tanstack/react-table';
import { IconCirclePlus, IconUserCheck, IconX } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { TaskForm } from '@/components/forms/create-task-form';
import { createTask } from '@/components/tasks/create-task.action';
import { DataTableFacetedFilter } from '@/components/tasks/table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/tasks/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { client as authClient } from '@/lib/auth/auth-client';
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
  const [open, setOpen] = useState(false);
  const [loading, startTransition] = useTransition();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleCreateTask = (values: any) => {
    startTransition(async () => {
      const result = await createTask(values, activeOrganization?.id);

      if (result.error) {
        toast.error(result.error || 'Failed to create task');
        return;
      }

      if (result.success) {
        toast.success('Task created successfully!', {
          description: `${values.title} has been created`,
        });
        setOpen(false);
      }
    });
  };

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
            table
              .getColumn('assignees')
              ?.setFilterValue(!assignedToMe ? true : undefined);
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

        <Button
          size="sm"
          onClick={() => setOpen(true)}
        >
          <IconCirclePlus className="size-4" />
          Add Task
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create new task</DialogTitle>
              <DialogDescription>
                Enter the details to create a new task
              </DialogDescription>
            </DialogHeader>

            <TaskForm
              loading={loading}
              onSubmit={handleCreateTask}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
