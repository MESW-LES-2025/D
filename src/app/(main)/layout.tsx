import { eq, and } from 'drizzle-orm';
import { headers } from 'next/headers';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskAssigneesTable, taskTable } from '@/schema/task';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

async function getUserPoints() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return 0;
  }

  try {
    const orgId = session.session?.activeOrganizationId ?? '';
    const userId = session.user.id;

    const tasks = await db
      .select({
        id: taskTable.id,
        status: taskTable.status,
        score: taskTable.score,
      })
      .from(taskTable)
      .innerJoin(
        taskAssigneesTable,
        eq(taskTable.id, taskAssigneesTable.taskId),
      )
      .where(
        and(
          eq(taskTable.organizationId, orgId),
          eq(taskAssigneesTable.userId, userId),
        ),
      );

    return tasks
      .filter(t => t.tasks.status === 'done')
      .reduce((sum, t) => sum + (t.tasks.score ?? 0), 0);
  } catch (e) {
    console.error('Failed to fetch user points:', e);
    return 0;
  }
}

export default async function Layout({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  const earnedPoints = await getUserPoints();

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" earnedPoints={earnedPoints} />
      <SidebarInset>
        {header}
        <main className="@container/main flex flex-1 flex-col gap-2">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
