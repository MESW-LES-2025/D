import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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

  return (
    <div className="  py-12">
      <div className="mx-auto max-w-lg px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <h1 className="mb-8 text-center text-3xl font-bold">
            Dashboard
          </h1>

          <div className="flex-1 space-y-3">
            This is the dashboard page
          </div>
        </div>
      </div>
    </div>
  );
}
