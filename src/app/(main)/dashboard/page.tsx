import type { Metadata } from 'next';
import { and, asc, eq, gte, inArray, lt } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { NoOrganization } from '@/components/empty/no-organization';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { memberTable, taskAssigneesTable, taskTable, userTable } from '@/schema';

export const metadata: Metadata = {
  title: 'TaskUp | Dashboard',
  description: 'Your personal dashboard to manage tasks efficiently.',
};

async function fetchMonthlyDoneTasks(organizationId: string, firstDay: Date, lastDay: Date) {
  try {
    return await db
      .select({
        id: taskTable.id,
        dueDate: taskTable.dueDate,
        difficulty: taskTable.difficulty,
        status: taskTable.status,
        score: taskTable.score,
      })
      .from(taskTable)
      .where(
        and(
          eq(taskTable.organizationId, organizationId ?? ''),
          eq(taskTable.status, 'done'),
          gte(taskTable.dueDate, firstDay),
          lt(taskTable.dueDate, lastDay),
        ),
      )
      .orderBy(asc(taskTable.dueDate));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

async function fetchOrganizationUsersWithTasks(organizationId: string, taskIds: string[]) {
  try {
    // Get users who are members of the current organization
    return await db
      .select({
        taskId: taskAssigneesTable.taskId ?? null,
        user: {
          id: userTable.id,
          name: userTable.name,
          image: userTable.image,
        },
      })
      .from(memberTable)
      .innerJoin(userTable, eq(memberTable.userId, userTable.id))
      .leftJoin(taskAssigneesTable, and(eq(taskAssigneesTable.userId, userTable.id), inArray(taskAssigneesTable.taskId, taskIds)))
      .where(eq(memberTable.organizationId, organizationId));
  } catch (error) {
    console.error('Error fetching assignees:', error);
    return [];
  }
}

async function fetchUserMonthlyTasks(userId: string, organizationId: string, firstDay: Date, lastDay: Date) {
  try {
    return await db
      .select({
        id: taskTable.id,
        dueDate: taskTable.dueDate,
        difficulty: taskTable.difficulty,
        status: taskTable.status,
        score: taskTable.score,
      })
      .from(taskTable)
      .innerJoin(taskAssigneesTable, eq(taskAssigneesTable.taskId, taskTable.id))
      .where(
        and(
          eq(taskTable.organizationId, organizationId),
          eq(taskAssigneesTable.userId, userId),
          gte(taskTable.dueDate, firstDay),
          lt(taskTable.dueDate, lastDay),
        ),
      );
  } catch (error) {
    console.error('Error fetching users tasks:', error);
    return [];
  }
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  if (!session.session?.activeOrganizationId) {
    return <NoOrganization />;
  }

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  // Fetch tasks from the current month with status equal 'done'
  const monthlyDoneTasks = await fetchMonthlyDoneTasks(session.session?.activeOrganizationId, firstDay, lastDay);

  // Fetch users from the organization with their tasks
  const usersWithTasks = await fetchOrganizationUsersWithTasks(session.session?.activeOrganizationId, monthlyDoneTasks.map(t => t.id));

  // Fetch all tasks from the current month and from the current user
  const currentUsermonthlyTasks = await fetchUserMonthlyTasks(session.session?.userId, session.session?.activeOrganizationId, firstDay, lastDay);

  return (
    <div className="h-full flex-1 flex-col gap-8 px-8 py-4 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Dashboard
          </h2>
          <p className="text-muted-foreground">
            Manage your monthly tasks effectively with our intuitive task tracker.
          </p>
        </div>
      </div>
      <Dashboard
        monthlyDoneTasks={monthlyDoneTasks}
        usersWithTasks={usersWithTasks}
        currentUsermonthlyTasks={currentUsermonthlyTasks}
        currentUserId={session.session?.userId}
        serverDate={today} // This avoid errors if the user is in a different timezone
      />
    </div>
  );
}
