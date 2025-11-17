// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as schema from '@/schema/user';

export async function GET() {
  try {
    // Use the existing Drizzle database instance
    const users = await db.select().from(schema.userTable);

    const userData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
