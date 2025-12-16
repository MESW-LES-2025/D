/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
'use client';

import type { TaskWithAssignees } from '@/lib/task/task-types';
import { IconLayoutKanban, IconList } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { columns as adminColumns } from '@/components/tasks/admin-table/columns';
import { DataTable as AdminDataTable } from '@/components/tasks/admin-table/data-table';
import { KanbanView } from '@/components/tasks/kanban';
import { columns } from '@/components/tasks/table/columns';
import { DataTable } from '@/components/tasks/table/data-table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

type TasksTabsProps = {
  tasks: TaskWithAssignees[];
  isAdmin: boolean;
  taskId?: string;
  currentUserId?: string;
};

const TASKS_TAB_STORAGE_KEY = 'tasks-active-tab';

export function TasksTabs({ tasks, isAdmin, taskId, currentUserId }: TasksTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('table');
  const [isMounted, setIsMounted] = useState(false);

  // Save and load active tab from localStorage, to persist between page reloads
  useEffect(() => {
    const savedTab = localStorage.getItem(TASKS_TAB_STORAGE_KEY);
    if (savedTab) {
      setActiveTab(savedTab);
    }
    setIsMounted(true);
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem(TASKS_TAB_STORAGE_KEY, tab);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="flex w-full gap-8">
      <TabsList className="h-10">
        <TabsTrigger value="table" className="p-4">
          <IconList className="size-5" />
          Table
        </TabsTrigger>
        <TabsTrigger value="board" className="p-4">
          <IconLayoutKanban className="size-5" />
          Board
        </TabsTrigger>
      </TabsList>
      <TabsContent value="table">
        {isAdmin
          ? (
              <AdminDataTable data={tasks} columns={adminColumns} isAdmin={isAdmin} autoOpenTaskId={taskId} />
            )
          : <DataTable data={tasks} columns={columns} isAdmin={isAdmin} autoOpenTaskId={taskId} />}
      </TabsContent>
      <TabsContent value="board">
        <KanbanView
          tasks={tasks}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
        />
      </TabsContent>
    </Tabs>
  );
}
