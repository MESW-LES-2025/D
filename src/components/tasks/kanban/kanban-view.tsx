'use client';

import type { FilterState } from './kanban-toolbar';
import type { TaskWithAssignees } from '@/lib/task/task-types';
import { useMemo, useState } from 'react';
import { allStatuses } from '@/lib/task/task-options';
import { filterTasks, KanbanToolbar } from './kanban-toolbar';
import { TaskKanbanBoard } from './task-kanban-board';

type KanbanViewProps = {
  tasks: TaskWithAssignees[];
  isAdmin?: boolean;
  currentUserId?: string;
};

export function KanbanView({ tasks, isAdmin = false, currentUserId }: KanbanViewProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    priority: [],
    difficulty: [],
    assignedToMe: false,
  });
  const [visibleStatuses, setVisibleStatuses] = useState<string[]>(
    allStatuses
      .filter(s => s.value !== 'archived')
      .map(s => s.value),
  );

  const filteredTasks = useMemo(() => {
    return filterTasks(tasks, filters, currentUserId);
  }, [tasks, filters, currentUserId]);

  const visibleStatusOptions = useMemo(() => {
    return allStatuses.filter(s => visibleStatuses.includes(s.value));
  }, [visibleStatuses]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex flex-col gap-4">
      <KanbanToolbar
        onFilterChange={handleFilterChange}
        isAdmin={isAdmin}
        visibleStatuses={visibleStatuses}
        onVisibleStatusesChange={setVisibleStatuses}
        statusOptions={allStatuses}
      />
      <TaskKanbanBoard
        tasks={filteredTasks}
        isAdmin={isAdmin}
        statusOptions={visibleStatusOptions}
      />
    </div>
  );
}
