'use client';

import type { Row } from '@tanstack/react-table';

import { IconDots } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DataTableRowActionsProps<TData> = {
  row: Row<TData>;
};

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const handleAction = (action: string) => {
    // This row is going to be used betterin the future
    // eslint-disable-next-line no-console
    console.log(`Action: ${action}`, row.original);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 data-[state=open]:bg-muted"
        >
          <IconDots />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => handleAction('Edit')}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('Change Status')}>Change Status</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction('Block/Unblock')}>Block/Unblock</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleAction('Archive')}>Archive</DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => handleAction('Delete')}>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
