import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client';
import { auth } from '@/lib/auth/auth';
import { fetchLeaderboardByOrganization } from './actions';

export const metadata: Metadata = {
  title: 'TaskUp | Leaderboard',
  description: 'View team members ranked by points.',
};

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/leaderboard');
  }

  if (!session.session?.activeOrganizationId) {
    return (
      <div className="min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-lg bg-card p-8 shadow-md">
            <h1 className="mb-4 text-center text-3xl font-bold">Leaderboard</h1>
            <p className="text-center text-muted-foreground">
              Please join an organization to view the leaderboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentUserId = session.user.id;
  const organizationId = session.session.activeOrganizationId;
  const leaderboardData = await fetchLeaderboardByOrganization(organizationId);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <h1 className="mb-8 text-center text-3xl font-bold">Leaderboard</h1>
          <LeaderboardClient
            initialData={leaderboardData}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
