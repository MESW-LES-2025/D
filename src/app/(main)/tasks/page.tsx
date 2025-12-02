import type { Metadata } from 'next';

import type { TaskWithAssignees } from '@/lib/task/task-types';
import { IconLayoutKanban, IconList } from '@tabler/icons-react';
import { eq, inArray } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { columns } from '@/components/data-table/columns';
import { DataTable } from '@/components/data-table/data-table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskAssigneesTable, taskTable } from '@/schema/task';
import { userTable } from '@/schema/user';

export const metadata: Metadata = {
  title: 'Tasks',
  description: 'A task and issue tracker build using Tanstack Table.',
};

export default async function TaskPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  // Fetch tasks from your database
  const tasksData = await db
    .select()
    .from(taskTable)
    .where(eq(taskTable.organizationId, session.session?.activeOrganizationId ?? ''));

  // Fetch assignees for all tasks
  const taskIds = tasksData.map(t => t.id);
  const assigneesData = taskIds.length > 0
    ? await db
        .select({
          taskId: taskAssigneesTable.taskId,
          user: userTable,
        })
        .from(taskAssigneesTable)
        .innerJoin(userTable, eq(taskAssigneesTable.userId, userTable.id))
        .where(inArray(taskAssigneesTable.taskId, taskIds))
    : [];

  // Group assignees by task
  const assigneesByTask = new Map<string, typeof assigneesData>();
  for (const assignment of assigneesData) {
    const existing = assigneesByTask.get(assignment.taskId) || [];
    assigneesByTask.set(assignment.taskId, [...existing, assignment]);
  }

  // Transform tasks to include assignees array
  const tasks: TaskWithAssignees[] = tasksData.map(task => ({
    ...task,
    assignees: (assigneesByTask.get(task.id) || []).map(a => ({
      ...a.user,
      isCurrentUser: a.user.id === session.session?.userId,
    })),
  }));

  return (
    <div className="h-full flex-1 flex-col gap-8 px-8 py-4 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Tasks
          </h2>
          <p className="text-muted-foreground">
            Manage your tasks effectively with our intuitive task tracker.
          </p>
        </div>
      </div>
      <Tabs defaultValue="table" className="flex w-full gap-8">
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
          <DataTable data={tasks} columns={columns} />
        </TabsContent>
        <TabsContent value="board">
          <div>Kanban Board coming soon...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
