'use client';

import { IconCheck, IconUser } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Add this import
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

type Redemption = {
  rewardId: string;
  userId: string;
  status: string;
  redeemedAt?: Date;
  pointsSpent: number;
};

type UserInfo = {
  id: string;
  name: string | null;
  email: string | null;
};

type RewardsManagementListProps = {
  rewards: Reward[];
  redemptions: Redemption[];
  organizationUsers: UserInfo[];
  onUpdateRedemptionStatus?: (
    rewardId: string,
    userId: string,
    status: 'completed' | 'cancelled',
  ) => Promise<void>;
};

export function RewardsManagementList({
  rewards,
  redemptions,
  organizationUsers,
  onUpdateRedemptionStatus,
}: RewardsManagementListProps) {
  const router = useRouter(); // Add this
  const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set());

  // Helper to get user info from userId
  const getUserInfo = (userId: string): UserInfo | undefined => {
    return organizationUsers.find(user => user.id === userId);
  };

  // Create a composite key for tracking updates
  const getCompositeKey = (rewardId: string, userId: string) => `${rewardId}:${userId}`;

  // Filter rewards to only those that have been redeemed by anyone
  const redeemedRewards = rewards.filter(reward =>
    redemptions.some(redemption => redemption.rewardId === reward.id),
  );

  // Group redemptions by reward
  const redemptionsByReward = redeemedRewards.map((reward) => {
    const rewardRedemptions = redemptions.filter(r => r.rewardId === reward.id);
    return {
      reward,
      redemptions: rewardRedemptions.map(redemption => ({
        ...redemption,
        userInfo: getUserInfo(redemption.userId),
      })),
    };
  });

  // Sort by most redemptions first, then by reward points
  redemptionsByReward.sort((a, b) => {
    if (b.redemptions.length !== a.redemptions.length) {
      return b.redemptions.length - a.redemptions.length;
    }
    return b.reward.points - a.reward.points;
  });

  // Helper function to get status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pending Approval', className: 'bg-amber-100 text-amber-800' };
      case 'completed':
        return { label: 'Completed', className: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { label: 'Cancelled', className: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    }
  };

  // Calculate stats
  const totalRedemptions = redemptions.length;
  const pendingCount = redemptions.filter(r => r.status === 'pending').length;
  const completedCount = redemptions.filter(r => r.status === 'completed').length;

  const handleUpdateStatus = async (rewardId: string, userId: string, status: 'completed' | 'cancelled') => {
    if (!onUpdateRedemptionStatus) {
      return;
    }

    const compositeKey = getCompositeKey(rewardId, userId);
    setUpdatingKeys(prev => new Set(prev).add(compositeKey));

    try {
      await onUpdateRedemptionStatus(rewardId, userId, status);
      router.refresh(); // Add this line to refresh the page
    } catch (error) {
      console.error('Failed to update redemption status:', error);
    } finally {
      setUpdatingKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(compositeKey);
        return newSet;
      });
    }
  };

  if (redeemedRewards.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-muted-foreground">
          <p className="text-lg">No redeemed rewards found</p>
          <p className="mt-1 text-sm">
            No users have redeemed any rewards yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="rounded-lg bg-muted p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Redemptions</p>
            <p className="text-2xl font-bold">{totalRedemptions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Redeemed Rewards Grid */}
      <div className="grid gap-6">
        {redemptionsByReward.map(({ reward, redemptions: rewardRedemptions }) => {
          const statusCounts = rewardRedemptions.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Filter redemptions to show pending ones first
          const sortedRedemptions = [...rewardRedemptions].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') {
              return -1;
            }
            if (a.status !== 'pending' && b.status === 'pending') {
              return 1;
            }
            return 0;
          });

          return (
            <div
              key={reward.id}
              className="rounded-lg border bg-card p-6"
            >
              <div className="space-y-4">
                {/* Reward Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* Reward Image */}
                    {reward.picture
                      ? (
                          <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                            <Image
                              src={reward.picture}
                              alt={reward.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )
                      : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}

                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-card-foreground">
                          {reward.title}
                        </h3>
                        <Badge variant="outline" className="font-medium">
                          {reward.points}
                          {' '}
                          pts
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {reward.description || 'No description provided'}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {rewardRedemptions.length}
                          {' '}
                          {rewardRedemptions.length === 1 ? 'redemption' : 'redemptions'}
                        </Badge>
                        {Object.entries(statusCounts).map(([status, count]) => {
                          const statusDisplay = getStatusDisplay(status);
                          return (
                            <Badge key={status} className={statusDisplay.className}>
                              {count}
                              {' '}
                              {statusDisplay.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Redemptions List */}
                <div className="rounded-lg border bg-muted/50">
                  <div className="border-b p-4">
                    <h4 className="font-medium text-card-foreground">
                      Users who redeemed this reward (
                      {rewardRedemptions.length}
                      )
                    </h4>
                  </div>
                  <div className="divide-y">
                    {sortedRedemptions.map((redemption, index) => {
                      const statusDisplay = getStatusDisplay(redemption.status);
                      const user = redemption.userInfo;
                      const compositeKey = getCompositeKey(redemption.rewardId, redemption.userId);
                      const isUpdating = updatingKeys.has(compositeKey);

                      return (
                        <div key={index} className="p-4">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                                {user?.name
                                  ? (
                                      <span className="font-medium">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    )
                                  : (
                                      <IconUser className="h-5 w-5 text-secondary-foreground" />
                                    )}
                              </div>
                              <div>
                                <p className="font-medium text-card-foreground">
                                  {user?.name || 'Unknown User'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {user?.email || 'No email available'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Redeemed</p>
                                <p className="font-medium">
                                  {redemption.redeemedAt
                                    ? new Date(redemption.redeemedAt).toLocaleDateString()
                                    : 'Unknown date'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge className={statusDisplay.className}>
                                  {statusDisplay.label}
                                </Badge>

                                {/* Action buttons for pending redemptions */}
                                {redemption.status === 'pending' && onUpdateRedemptionStatus && (
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                      onClick={() => handleUpdateStatus(redemption.rewardId, redemption.userId, 'completed')}
                                      disabled={isUpdating}
                                    >
                                      {isUpdating
                                        ? (
                                            'Updating...'
                                          )
                                        : (
                                            <>
                                              <IconCheck className="mr-1 h-3 w-3" />
                                              Approve
                                            </>
                                          )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
