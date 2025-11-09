import type { User } from 'better-auth';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { SignOutButton } from '@/components/SignOutButton';
import { auth } from '@/lib/auth/auth';

export const metadata: Metadata = {
  title: 'TaskUp | Dashboard',
  description: 'Your personal dashboard to manage tasks efficiently.',
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  const user: User = session.user;

  return (
    <div className="min-h-screen  py-12">
      <div className="mx-auto max-w-lg px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <h1 className="mb-8 text-center text-3xl font-bold">
            Dashboard
          </h1>

          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-base font-medium">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-base font-medium">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-xs text-muted-foreground">
                {user.id}
              </p>
            </div>

            {user.image && (
              <div className="shrink-0">
                <Image
                  src={user.image}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-border shadow-sm"
                />
              </div>
            )}

            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
