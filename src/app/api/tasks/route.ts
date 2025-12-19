import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { taskTable } from '@/schema/task';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const tasks = await db
      .select({
        id: taskTable.id,
        title: taskTable.title,
        status: taskTable.status,
        priority: taskTable.priority,
        difficulty: taskTable.difficulty,
      })
      .from(taskTable)
      .where(eq(taskTable.organizationId, session.session?.activeOrganizationId ?? ''));

    return NextResponse.json(tasks);
  } catch (e) {
    console.error('Failed to fetch tasks for api/tasks', e);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
