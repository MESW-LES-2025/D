import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth/auth';

export const metadata: Metadata = {
  title: 'TaskUp | Settings',
  description: 'Manage the team settings and preferences.',
};

export default async function Home() {
  // Ensure the user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/dashboard');
  }

  return (
    <div className="min-h-screen  py-12">
      <div className="mx-auto max-w-lg px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <h1 className="mb-8 text-center text-3xl font-bold">
            Settings
          </h1>

          <div className="flex-1 space-y-3">
            This is the settings page
          </div>
        </div>
      </div>
    </div>
  );
}
