import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { userPointsTable } from '@/schema';

async function getUserPoints() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return 0;
  }

  try {
    const orgId = session.session?.activeOrganizationId ?? '';
    const userId = session.user.id;

    const [userPoints] = await db
      .select()
      .from(userPointsTable)
      .where(
        and(
          eq(userPointsTable.userId, userId),
          eq(userPointsTable.organizationId, orgId),
        ),
      )
      .limit(1);

    return userPoints?.totalPoints ?? 0;
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
