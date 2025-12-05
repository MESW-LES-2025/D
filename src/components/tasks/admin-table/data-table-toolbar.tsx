'use client';

import type { Table } from '@tanstack/react-table';
import type { Task } from '@/lib/task/task-types';
import { IconArchive, IconCirclePlus, IconTrash, IconX } from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { TaskForm } from '@/components/forms/create-task-form';
import { archiveTask } from '@/components/tasks/archive-task.action';
import { deleteTask } from '@/components/tasks/delete-task.action';
import { DataTableViewOptions } from '@/components/tasks/table/data-table-view-options';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { difficulties, priorities, allStatuses as statuses } from '@/lib/task/task-options';
import { createTask } from '../create-task.action';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
};

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, startTransition] = useTransition();

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
        setShowCreateDialog(false);
      }
    });
  };

  const handleBulkArchive = async () => {
    setIsArchiving(true);
    const tasks = selectedRows.map(row => row.original as Task);

    try {
      const results = await Promise.allSettled(
        tasks.map(task => archiveTask(task.id)),
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.error === undefined).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully archived ${successCount} task${successCount > 1 ? 's' : ''}`);
      }

      if (failCount > 0) {
        toast.error(`Failed to archive ${failCount} task${failCount > 1 ? 's' : ''}`);
      }

      table.resetRowSelection();
      setShowArchiveDialog(false);
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    const tasks = selectedRows.map(row => row.original as Task);

    try {
      const results = await Promise.allSettled(
        tasks.map(task => deleteTask(task.id)),
      );

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.error === undefined).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} task${successCount > 1 ? 's' : ''}`);
      }

      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} task${failCount > 1 ? 's' : ''}`);
      }

      table.resetRowSelection();
      setShowDeleteDialog(false);
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
              }}
            >
              Reset
              <IconX />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions - Shows when rows are selected */}
          {selectedCount > 0 && (
            <>

              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setShowArchiveDialog(true)}
                className="cursor-pointer gap-2"
              >
                <IconArchive className="size-4" />
              </Button>

              <Button
                variant="destructive"
                size="icon-sm"
                onClick={() => setShowDeleteDialog(true)}
                className="cursor-pointer gap-2"
              >
                <IconTrash className="size-4" />
              </Button>
            </>
          )}

          <DataTableViewOptions table={table} />
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <IconCirclePlus className="size-4" />
            Add Task
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create new task</DialogTitle>
                <DialogDescription>
                  Enter the details to create a new task
                </DialogDescription>
              </DialogHeader>

              <TaskForm
                loading={isCreating}
                onSubmit={handleCreateTask}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Archive
              {' '}
              {selectedCount}
              {' '}
              {selectedCount === 1 ? 'task' : 'tasks'}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected tasks. You can restore them later from the archived section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBulkArchive();
              }}
              disabled={isArchiving}
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete
              {' '}
              {selectedCount}
              {' '}
              {selectedCount === 1 ? 'task' : 'tasks'}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the selected tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
