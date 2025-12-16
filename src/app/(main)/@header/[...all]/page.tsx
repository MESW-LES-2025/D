import { desc, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { DynamicHeader } from '@/components/layout/dynamic-header';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { notificationTable } from '@/schema';

// Define routes that shouldn't be clickable when they have children
const NON_CLICKABLE_PARENTS = new Set(['settings']);

export default async function Header({
  params,
}: { params: Promise<{ all: string[] }> }) {
  const { all } = await params;

  const breadcrumbs = all.map((route, i) => {
    const isLast = i === all.length - 1;
    const hasChildren = i < all.length - 1;
    const shouldBeClickable = !isLast && !(hasChildren && NON_CLICKABLE_PARENTS.has(route));

    return {
      label: route,
      href: shouldBeClickable ? `/${all.slice(0, i + 1).join('/')}` : undefined,
    };
  });

  // Fetch notifications
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const notifications = await db
    .select()
    .from(notificationTable)
    .where(eq(notificationTable.userId, session?.session?.userId ?? ''))
    .orderBy(desc(notificationTable.createdAt))
    .limit(20);

  // Default header with no actions
  return <DynamicHeader breadcrumbs={breadcrumbs} data={{ notifications }} />;
}
