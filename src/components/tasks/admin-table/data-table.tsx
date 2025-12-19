/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
'use client';

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';

import type { TaskWithAssignees } from '@/lib/task/task-types';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { DataTablePagination } from '@/components/tasks/table/data-table-pagination';
import { TaskSheet } from '@/components/tasks/task-sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTableToolbar } from './data-table-toolbar';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isAdmin?: boolean;
  autoOpenTaskId?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  isAdmin = false,
  autoOpenTaskId,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const [selectedRow, setSelectedRow] = React.useState<TData | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility]
    = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Auto-open task sheet if taskId is in URL
  React.useEffect(() => {
    if (autoOpenTaskId && data.length > 0) {
      const taskToOpen = data.find(
        row => (row as TaskWithAssignees).id === autoOpenTaskId,
      );

      if (taskToOpen) {
        setSelectedRow(taskToOpen);
        setSheetOpen(true);

        // Clean up URL after opening (optional)
        router.replace('/tasks', { scroll: false });
      }
    }
  }, [autoOpenTaskId, data, router]);

  // Sync selectedRow with fresh data when data changes
  React.useEffect(() => {
    if (selectedRow && sheetOpen) {
      const updatedRow = data.find(
        row => (row as TaskWithAssignees).id === (selectedRow as unknown as TaskWithAssignees).id,
      );
      if (updatedRow) {
        setSelectedRow(updatedRow);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sheetOpen]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar table={table} />

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length
              ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => {
                        setSelectedRow(row.original);
                        setSheetOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )
              : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />

      {/* Sheet opens when a row is clicked */}
      <TaskSheet open={sheetOpen} onOpenChangeAction={setSheetOpen} task={selectedRow as TaskWithAssignees} isAdmin={isAdmin} />
    </div>
  );
}
