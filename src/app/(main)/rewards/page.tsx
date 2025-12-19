import type { User } from 'better-auth';
import type { Metadata } from 'next';
import { IconGift, IconUsers } from '@tabler/icons-react';
import { and, eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { CreateRewardDialog } from '@/components/dialogs/create-reward-dialog';
import { RewardsManagementList } from '@/components/rewards/redemptions-list';
import { RewardsList } from '@/components/rewards/rewards-list';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/db';
import { recordPointTransaction } from '@/lib/utils/pointTransactionHelpers';
import { userPointsTable } from '@/schema';
import * as organizationSchema from '@/schema/organization';
import { rewardRedemptionsTable, rewardTable } from '@/schema/reward';
import { userTable } from '@/schema/user';

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

    // Record the point transaction (deduct points)
    await recordPointTransaction(
      userId,
      organizationId,
      null, // taskId is null for reward redemptions
      'reward_redemption',
      -reward.points, // Negative number for deduction
      {
        rewardId: reward.id,
        rewardTitle: reward.title,
        rewardPoints: reward.points,
        transactionType: 'reward_redemption',
      },
    );

    // Create the redemption record with 'pending' status
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

async function removeReward(rewardId: string) {
  'use server';
  try {
    // Check if any user has redeemed this reward
    const existingRedemptions = await db
      .select()
      .from(rewardRedemptionsTable)
      .where(eq(rewardRedemptionsTable.rewardId, rewardId))
      .limit(1);

    if (existingRedemptions.length > 0) {
      throw new Error('Cannot remove reward that has been redeemed by users');
    }

    // Delete the reward
    await db.delete(rewardTable).where(eq(rewardTable.id, rewardId));

    return { success: true };
  } catch (error) {
    console.error('Failed to remove reward:', error);
    throw error;
  }
}

type OrganizationUser = {
  id: string;
  memberId: string;
  name: string;
  role: string;
  email: string;
  image: string | null;
  createdAt: Date;
};

async function getUsersInOrganization(organizationId: string | null | undefined): Promise<OrganizationUser[]> {
  if (!organizationId) {
    return [];
  }
  try {
    // Get users who are members of the current organization
    const organizationUsers = await db.select({
      id: userTable.id,
      memberId: organizationSchema.memberTable.id,
      name: userTable.name,
      role: organizationSchema.memberTable.role,
      email: userTable.email,
      image: userTable.image,
      createdAt: userTable.createdAt,
    })
      .from(organizationSchema.memberTable)
      .innerJoin(userTable, eq(organizationSchema.memberTable.userId, userTable.id))
      .where(eq(organizationSchema.memberTable.organizationId, organizationId));

    return organizationUsers;
  } catch (error) {
    console.error('Error fetching organization users:', error);
    return [];
  }
}

async function getAllRedemptions(organizationId: string) {
  try {
    const allRedemptions = await db
      .select({
        rewardId: rewardRedemptionsTable.rewardId,
        userId: rewardRedemptionsTable.userId,
        status: rewardRedemptionsTable.status,
        redeemedAt: rewardRedemptionsTable.redeemedAt,
      })
      .from(rewardRedemptionsTable)
      .where(eq(rewardRedemptionsTable.organizationId, organizationId));

    return allRedemptions;
  } catch (error) {
    console.error('Failed to fetch all redemptions:', error);
    return [];
  }
}

export default async function RewardsPage() {
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
  const organizationUsers = await getUsersInOrganization(organizationId);
  const allRedemptions = await getAllRedemptions(organizationId);

  // TODO: Implement proper role-based access control
  // For now, placeholder - you can replace this with actual role checking
  const userRole = 'admin'; // This should come from your session/member data
  const isAdmin = ['admin', 'owner'].includes(userRole);
  const canRemove = isAdmin; // Only admins can remove rewards
  const canViewManagement = isAdmin; // Only admins can view management tab

  return (
    <div className="min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-lg bg-card p-8 shadow-md">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Rewards
                {activeOrganization ? ` for ${activeOrganization.name}` : ''}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {currentUser.name}
                , redeem your points for exciting rewards!
              </p>
            </div>
            <CreateRewardDialog>
              <Button>+ New Reward</Button>
            </CreateRewardDialog>
          </div>

          <Tabs defaultValue="rewards" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="h-12">
                <TabsTrigger value="rewards" className="px-4 py-2 text-base">
                  <IconGift className="mr-2 h-5 w-5" />
                  Available Rewards
                </TabsTrigger>
                {canViewManagement && (
                  <TabsTrigger value="management" className="px-4 py-2 text-base">
                    <IconUsers className="mr-2 h-5 w-5" />
                    Redemptions Management
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Points Summary - Show in both tabs */}
              <div className="rounded-lg bg-muted px-4 py-2">
                <p className="text-sm text-muted-foreground">Your Points</p>
                <p className="text-2xl font-bold">{earnedPoints}</p>
              </div>
            </div>

            <TabsContent value="rewards" className="space-y-4">
              {rewardsInOrg.length === 0
                ? (
                    <div className="py-12 text-center">
                      <div className="mb-4 text-muted-foreground">
                        <p className="text-lg">No rewards found</p>
                        <p className="mt-1 text-sm">
                          Be the first to create a reward!
                        </p>
                      </div>
                    </div>
                  )
                : (
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
                      onRemove={async (rewardId: string) => {
                        'use server';
                        await removeReward(rewardId);
                      }}
                      canRemove={canRemove}
                    />
                  )}
            </TabsContent>

            {canViewManagement && (
              <TabsContent value="management" className="space-y-4">
                <RewardsManagementList
                  rewards={rewardsInOrg}
                  redemptions={allRedemptions}
                  organizationUsers={organizationUsers}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
