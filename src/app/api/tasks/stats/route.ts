import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskAssigneesTable, taskTable } from '@/schema/task';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orgId = session.session?.activeOrganizationId ?? '';
    const userId = session.user.id;

    // Fetch tasks assigned to the current user in the organization
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

    // Calculate statistics
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const totalPoints = tasks.reduce((sum, t) => sum + (t.score || 0), 0);
    const earnedPoints = tasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.score || 0), 0);

    return NextResponse.json({
      total,
      completed,
      totalPoints,
      earnedPoints,
    });
  } catch (e) {
    console.error('Failed to fetch task stats:', e);
    return NextResponse.json({ error: 'Failed to fetch task stats' }, { status: 500 });
  }
}
