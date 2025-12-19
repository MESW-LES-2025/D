import type { User } from 'better-auth';
import type { Metadata } from 'next';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateRewardDialog } from '@/components/dialogs/create-reward-dialog';
import { RewardsList } from '@/components/rewards/rewards-list';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { userPointsTable } from '@/schema';
import * as organizationSchema from '@/schema/organization';
import { rewardRedemptionsTable, rewardTable } from '@/schema/reward';

export const metadata: Metadata = {
  title: 'TaskUp | Rewards',
  description: 'Redeem Rewards with the points you gain!',
};

async function getActiveOrganization(organizationId: undefined | null | string) {
  if (!organizationId) {
    return null;
  }
  try {
    const organizations = await db.select()
      .from(organizationSchema.organizationTable)
      .where(eq(organizationSchema.organizationTable.id, organizationId));
    return organizations[0] || null;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

type Reward = {
  id: string;
  title: string;
  description: string | null;
  points: number;
  picture: string | null;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

async function getRewardsInOrganization(organizationId: string | null | undefined): Promise<Reward[]> {
  if (!organizationId) {
    return [];
  }
  try {
    const rewardsInOrg = await db.select({
      id: rewardTable.id,
      title: rewardTable.title,
      description: rewardTable.description,
      points: rewardTable.points,
      picture: rewardTable.picture,
      organizationId: rewardTable.organizationId,
      createdAt: rewardTable.createdAt,
      updatedAt: rewardTable.updatedAt,
    })
      .from(rewardTable)
      .where(eq(rewardTable.organizationId, organizationId));

    return rewardsInOrg;
  } catch (error) {
    console.error('Error fetching organization users:', error);
    return [];
  }
}

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

async function redeemReward(rewardId: string, userId: string, organizationId: string) {
  'use server';

  try {
    const [reward] = await db
      .select()
      .from(rewardTable)
      .where(eq(rewardTable.id, rewardId))
      .limit(1);

    if (!reward) {
      throw new Error('Reward not found');
    }

    const existingRedemption = await db
      .select()
      .from(rewardRedemptionsTable)
      .where(
        and(
          eq(rewardRedemptionsTable.rewardId, rewardId),
          eq(rewardRedemptionsTable.userId, userId),
          eq(rewardRedemptionsTable.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (existingRedemption.length > 0) {
      throw new Error('You have already redeemed this reward');
    }

    const [userPoints] = await db
      .select()
      .from(userPointsTable)
      .where(
        and(
          eq(userPointsTable.userId, userId),
          eq(userPointsTable.organizationId, organizationId),
        ),
      )
      .limit(1);

    const currentPoints = userPoints?.totalPoints ?? 0;

    if (currentPoints < reward.points) {
      throw new Error('Insufficient points');
    }

    await db.insert(rewardRedemptionsTable).values({
      rewardId,
      userId,
      organizationId,
      pointsSpent: reward.points,
      status: 'pending',
      redeemedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to redeem reward:', error);
    throw error;
  }
}

async function getUserRedemptions(userId: string, organizationId: string) {
  try {
    const userRedemptions = await db
      .select({
        rewardId: rewardRedemptionsTable.rewardId,
        userId: rewardRedemptionsTable.userId,
        status: rewardRedemptionsTable.status,
      })
      .from(rewardRedemptionsTable)
      .where(
        and(
          eq(rewardRedemptionsTable.userId, userId),
          eq(rewardRedemptionsTable.organizationId, organizationId),
        ),
      );

    return userRedemptions;
  } catch (error) {
    console.error('Failed to fetch user redemptions:', error);
    return [];
  }
}

// Then in your page component:

export default async function TeamPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect('/sign-in?callbackUrl=/sign-in');
  }

  const currentUser: User = session.user;
  const activeOrganization = await getActiveOrganization(session.session.activeOrganizationId);
  const rewardsInOrg = await getRewardsInOrganization(session.session.activeOrganizationId);
  const earnedPoints = await getUserPoints();
  const organizationId = session.session.activeOrganizationId || '';
  const userRedemptions = await getUserRedemptions(currentUser.id, organizationId);

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <div className="flex items-start justify-between">
            <h1 className="mb-8 text-center text-3xl font-bold">
              Rewards available for
              {activeOrganization ? ` ${activeOrganization.name}` : ' Your Organization'}
            </h1>
            <CreateRewardDialog>
              <Button>+ New Reward</Button>
            </CreateRewardDialog>
          </div>

          <div className="space-y-4">
            <p>
              {currentUser.name}
              , redeem your points for exciting rewards! Browse through the available options and choose what you like.
            </p>
            <div className="space-y-4">
              <RewardsList
                rewards={rewardsInOrg}
                earnedPoints={earnedPoints}
                userId={currentUser.id}
                organizationId={organizationId}
                redemptions={userRedemptions}
                onRedeem={async (rewardId: string) => {
                  'use server';
                  await redeemReward(rewardId, currentUser.id, organizationId);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
