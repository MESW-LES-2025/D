'use client';

import type { StatusOption, TaskWithAssignees } from '@/lib/task/task-types';
import {
  IconAdjustmentsHorizontal,
  IconCheck,
  IconCirclePlus,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { TaskForm } from '@/components/forms/create-task-form';
import { createTask } from '@/components/tasks/create-task.action';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { client as authClient } from '@/lib/auth/auth-client';
import { difficulties, priorities } from '@/lib/task/task-options';
import { cn } from '@/lib/utils';

type KanbanToolbarProps = {
  onFilterChange: (filters: FilterState) => void;
  isAdmin?: boolean;
  visibleStatuses: string[];
  onVisibleStatusesChange: (statuses: string[]) => void;
  statusOptions: StatusOption[];
};

export type FilterState = {
  search: string;
  priority: string[];
  difficulty: string[];
  assignedToMe: boolean;
};

type FacetedFilterProps = {
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  selectedValues: Set<string>;
  onSelectionChange: (values: Set<string>) => void;
};

function FacetedFilter({ title, options, selectedValues, onSelectionChange }: FacetedFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <IconCirclePlus />
          {title}
          {selectedValues.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden gap-1 lg:flex">
                {selectedValues.size > 2
                  ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedValues.size}
                        {' '}
                        selected
                      </Badge>
                    )
                  : (
                      options
                        .filter(option => selectedValues.has(option.value))
                        .map(option => (
                          <Badge
                            variant="secondary"
                            key={option.value}
                            className="rounded-sm px-1 font-normal"
                          >
                            {option.label}
                          </Badge>
                        ))
                    )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      const newSelectedValues = new Set(selectedValues);
                      if (isSelected) {
                        newSelectedValues.delete(option.value);
                      } else {
                        newSelectedValues.add(option.value);
                      }
                      onSelectionChange(newSelectedValues);
                    }}
                  >
                    <div
                      className={cn(
                        'flex size-4 items-center justify-center rounded-lg border',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-input [&_svg]:invisible',
                      )}
                    >
                      <IconCheck className="size-3.5 text-primary-foreground" />
                    </div>
                    {option.icon && (
                      <option.icon className="size-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onSelectionChange(new Set())}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function KanbanToolbar({
  onFilterChange,
  isAdmin = false,
  visibleStatuses,
  onVisibleStatusesChange,
  statusOptions,
}: KanbanToolbarProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: [],
    difficulty: [],
    assignedToMe: false,
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, startTransition] = useTransition();

  const { data: activeOrganization } = authClient.useActiveOrganization();

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetState: FilterState = {
      search: '',
      priority: [],
      difficulty: [],
      assignedToMe: false,
    };
    setFilters(resetState);
    onFilterChange(resetState);
  };

  const hasActiveFilters
    = filters.search !== ''
      || filters.priority.length > 0
      || filters.difficulty.length > 0
      || filters.assignedToMe;

  const handleCreateTask = (values: any) => {
    startTransition(async () => {
      if (!activeOrganization?.id) {
        toast.error('No active organization selected');
        return;
      }

      const result = await createTask(values, activeOrganization.id);

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

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Filter tasks..."
          value={filters.search}
          onChange={e => updateFilters({ ...filters, search: e.target.value })}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <FacetedFilter
          title="Priority"
          options={priorities}
          selectedValues={new Set(filters.priority)}
          onSelectionChange={(values) => {
            updateFilters({ ...filters, priority: Array.from(values) });
          }}
        />

        <FacetedFilter
          title="Difficulty"
          options={difficulties}
          selectedValues={new Set(filters.difficulty)}
          onSelectionChange={(values) => {
            updateFilters({ ...filters, difficulty: Array.from(values) });
          }}
        />

        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-8 border-dashed',
            filters.assignedToMe && 'border-solid bg-accent',
          )}
          onClick={() => updateFilters({ ...filters, assignedToMe: !filters.assignedToMe })}
        >
          <IconUserCheck />
          My Tasks
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
          >
            Reset
            <IconX />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto hidden h-8 lg:flex"
            >
              <IconAdjustmentsHorizontal />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {statusOptions.map(status => (
              <DropdownMenuCheckboxItem
                key={status.value}
                className="capitalize"
                checked={visibleStatuses.includes(status.value)}
                onSelect={e => e.preventDefault()}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onVisibleStatusesChange([...visibleStatuses, status.value]);
                  } else {
                    // Prevent unchecking if it's the last visible status
                    if (visibleStatuses.length > 1) {
                      onVisibleStatusesChange(visibleStatuses.filter(s => s !== status.value));
                    }
                  }
                }}
              >
                <status.icon className="size-4" />
                {status.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isAdmin && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

// Helper function to filter tasks based on filter state
export function filterTasks(tasks: TaskWithAssignees[], filters: FilterState, currentUserId?: string): TaskWithAssignees[] {
  return tasks.filter((task) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Priority filter (array-based)
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Difficulty filter (array-based)
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(task.difficulty)) {
      return false;
    }

    // Assigned to me filter
    if (filters.assignedToMe && currentUserId) {
      const isAssigned = task.assignees?.some(a => a.id === currentUserId);
      if (!isAssigned) {
        return false;
      }
    }

    return true;
  });
}
