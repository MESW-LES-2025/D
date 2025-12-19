import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { rewardTable } from '@/schema/reward';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session?.activeOrganizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, points, picture } = await request.json();

    // Insert reward
    const newReward = await db.insert(rewardTable).values({
      title,
      description,
      points,
      picture,
      organizationId: session.session.activeOrganizationId,
    }).returning();

    return NextResponse.json(newReward[0]);
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 });
  }
}
