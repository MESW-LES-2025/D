'use client';

import { IconCircle, IconTrash } from '@tabler/icons-react';
import Image from 'next/image';
import { toast } from 'sonner';
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

type RedemptionStatus = 'toClaim' | 'pending' | 'completed' | 'cancelled';

// Helper function to safely convert string to RedemptionStatus
const toRedemptionStatus = (status: string): RedemptionStatus => {
  if (!status) {
    return 'toClaim';
  }
  return ['toClaim', 'pending', 'completed', 'cancelled'].includes(status)
    ? status as RedemptionStatus
    : 'toClaim';
};

type Redemption = {
  rewardId: string;
  userId: string;
  status: string;
};

type RewardsListProps = {
  rewards: Reward[];
  earnedPoints: number;
  userId: string;
  organizationId: string | null;
  redemptions: Redemption[];
  onRedeem: (rewardId: string) => Promise<void>;
  onRemove: (rewardId: string) => Promise<void>; // New prop for removing rewards
  canRemove: boolean; // New prop to check if user can remove rewards
};

export function RewardsList({
  rewards,
  earnedPoints,
  userId,
  // organizationId,
  redemptions,
  onRedeem,
  onRemove,
  canRemove,
}: RewardsListProps) {
  // Helper function to check if a reward is redeemed
  const getRewardStatus = (rewardId: string): RedemptionStatus | null => {
    const redemption = redemptions.find(r => r.rewardId === rewardId && r.userId === userId);
    if (!redemption) {
      return null;
    }
    return toRedemptionStatus(redemption.status);
  };

  // Check if ANY user has redeemed this reward (not just current user)
  const isRewardRedeemedByAnyone = (rewardId: string): boolean => {
    return redemptions.some(r => r.rewardId === rewardId);
  };

  const handleRemove = async (reward: Reward) => {
    if (isRewardRedeemedByAnyone(reward.id)) {
      toast.error('Cannot Remove', {
        description: 'This reward has been redeemed by users and cannot be removed.',
      });
      return;
    }

    const toastId = toast.loading('Removing reward...');

    try {
      await onRemove(reward.id);

      toast.success('Reward Removed!', {
        description: `Successfully removed ${reward.title}.`,
        id: toastId,
      });
    } catch (error) {
      console.error('Failed to remove reward:', error);
      toast.error('Removal Failed', {
        description: error instanceof Error ? error.message : 'There was an error removing the reward. Please try again.',
        id: toastId,
      });
    }
  };

  // Sort rewards: non-redeemed first (by points), then redeemed (by redemption status/points)
  const sortedRewards = [...rewards].sort((a, b) => {
    const aStatus = getRewardStatus(a.id);
    const bStatus = getRewardStatus(b.id);

    // First, separate redeemed and non-redeemed
    if (aStatus === null && bStatus !== null) {
      return -1; // a (non-redeemed) comes before b (redeemed)
    }
    if (aStatus !== null && bStatus === null) {
      return 1; // a (redeemed) comes after b (non-redeemed)
    }

    // If both are non-redeemed, sort by points (lowest to highest)
    if (aStatus === null && bStatus === null) {
      return a.points - b.points;
    }

    // If both are redeemed, sort by redemption status
    if (aStatus !== null && bStatus !== null) {
      // Sort by status order: 'pending' -> 'completed' -> 'cancelled'
      const statusOrder = { pending: 1, completed: 2, cancelled: 3 };
      const aStatusOrder = statusOrder[aStatus as keyof typeof statusOrder] || 4;
      const bStatusOrder = statusOrder[bStatus as keyof typeof statusOrder] || 4;

      if (aStatusOrder !== bStatusOrder) {
        return aStatusOrder - bStatusOrder;
      }

      // If same status, sort by points
      return a.points - b.points;
    }

    return 0;
  });

  const handleRedeem = async (reward: Reward) => {
    const rewardStatus = getRewardStatus(reward.id);
    if (rewardStatus !== null) {
      toast.error('Already Redeemed', {
        description: `You have already redeemed this reward. Status: ${rewardStatus}`,
      });
      return;
    }

    if (reward.points > earnedPoints) {
      toast.error('Insufficient Points', {
        description: `You need ${reward.points - earnedPoints} more points to redeem this reward.`,
      });
      return;
    }

    const toastId = toast.loading('Processing your redemption...');

    try {
      await onRedeem(reward.id);

      toast.success('Reward Redeemed!', {
        description: `You have successfully redeemed ${reward.title}. Your request is pending approval.`,
        id: toastId,
      });
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      toast.error('Redemption Failed', {
        description: error instanceof Error ? error.message : 'There was an error redeeming the reward. Please try again.',
        id: toastId,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Points Summary */}
      <div className="rounded-lg bg-muted p-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Your Points</p>
            <p className="text-2xl font-bold">{earnedPoints}</p>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedRewards.map((reward) => {
          const rewardStatus = getRewardStatus(reward.id);
          const isRedeemed = rewardStatus !== null;
          const isRedeemedByAnyone = isRewardRedeemedByAnyone(reward.id);
          const canAfford = earnedPoints >= reward.points && !isRedeemed;

          // Show progress as either earned points or reward points (whichever is smaller)
          const displayPoints = Math.min(earnedPoints, reward.points);
          const percentage = canAfford ? 100 : (displayPoints / reward.points) * 100;

          return (
            <div
              key={reward.id}
              className={`rounded-lg border p-4 ${
                isRedeemed
                  ? 'bg-muted'
                  : 'border-border bg-card'
              }`}
            >
              {/* Redeemed Badge */}
              {isRedeemed && (
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                    <IconCircle className="h-4 w-4 text-secondary-foreground" />
                    <span className="text-sm font-medium text-secondary-foreground">
                      {rewardStatus === 'pending'
                        ? 'Pending Approval'
                        : rewardStatus === 'completed'
                          ? 'Redeemed!'
                          : 'Cancelled'}
                    </span>
                  </div>
                  {rewardStatus === 'pending' && (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                      Awaiting approval
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {/* Reward Image */}
                {reward.picture
                  ? (
                      <div className={`relative h-40 w-full overflow-hidden rounded-lg ${
                        isRedeemed ? '' : 'grayscale'
                      }`}
                      >
                        <Image
                          src={reward.picture}
                          alt={reward.title}
                          fill
                          className="object-cover"
                        />
                        {!isRedeemed && (
                          <div className="absolute inset-0 bg-black/10" />
                        )}
                      </div>
                    )
                  : (
                      <div className={`flex h-40 w-full items-center justify-center rounded-lg ${
                        isRedeemed ? 'border' : 'bg-muted'
                      }`}
                      >
                        <span className={isRedeemed ? 'text-muted-foreground' : 'text-muted-foreground'}>
                          No image
                        </span>
                      </div>
                    )}

                {/* Reward Title and Points */}
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {reward.title}
                  </h3>
                  <div className={`rounded-full px-3 py-1 text-sm font-medium ${
                    isRedeemed
                      ? canAfford
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                  >
                    {reward.points}
                    {' '}
                    pts
                  </div>
                </div>

                {/* Reward Description */}
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {reward.description || 'No description provided'}
                </p>

                {/* Progress Bar Section - Only show for non-redeemed items */}
                {!isRedeemed && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium text-card-foreground">
                        {displayPoints}
                        /
                        {reward.points}
                        {' '}
                        pts
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          canAfford ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Status Text */}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {canAfford
                          ? (
                              <span className="font-medium text-green-600">
                                ✓ Ready to claim!
                              </span>
                            )
                          : (
                              <span className="text-card-foreground">
                                {reward.points - earnedPoints > 0
                                  ? `${reward.points - earnedPoints} more points needed`
                                  : 'Ready to claim!'}
                              </span>
                            )}
                      </span>
                      <span className="font-medium text-card-foreground">
                        {percentage.toFixed(0)}
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {isRedeemed
                    ? (
                        <div className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2">
                          <IconCircle className="h-4 w-4 text-secondary-foreground" />
                          <span className="text-sm font-medium text-secondary-foreground">
                            {rewardStatus === 'pending' ? 'Pending Approval' : 'Redeemed!'}
                          </span>
                        </div>
                      )
                    : (
                        <>
                          <Button
                            variant={canAfford ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => handleRedeem(reward)}
                            disabled={!canAfford}
                          >
                            {canAfford ? 'Claim Now' : 'Need More Points'}
                          </Button>
                          {canRemove && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(reward)}
                              disabled={isRedeemedByAnyone}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                </div>

                {/* Created Date */}
                <div className="border-t pt-2 text-xs text-muted-foreground">
                  Added
                  {' '}
                  {new Date(reward.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results message */}
      {rewards.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-4 text-muted-foreground">
            <p className="text-lg">No rewards found</p>
            <p className="mt-1 text-sm">
              Be the first to create a reward!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
