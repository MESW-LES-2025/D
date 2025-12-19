import {
  IconAward,
  IconBolt,
  IconFlame,
  IconMedal,
  IconSparkles,
  IconStar,
  IconTarget,
  IconTrophy,
} from '@tabler/icons-react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AchievementsPageClient } from '@/components/achievements/achievements-page-client';
import { checkAllAchievements } from '@/lib/achievements/achievement-checkers';
import { auth } from '@/lib/auth/auth';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  category: 'beginner' | 'intermediate' | 'advanced' | 'legendary';
  points: number;
  unlockDate?: string;
};

const allAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first task and begin your journey',
    icon: <IconStar className="h-12 w-12" />,
    isUnlocked: false,
    category: 'beginner',
    points: 10,
  },
  {
    id: '2',
    name: 'Task Master',
    description: 'Complete 5 tasks in a single day',
    icon: <IconTarget className="h-12 w-12" />,
    isUnlocked: false,
    category: 'beginner',
    points: 25,
  },
  {
    id: '3',
    name: 'Speed Demon',
    description: 'Complete 3 tasks in under 30 minutes',
    icon: <IconBolt className="h-12 w-12" />,
    isUnlocked: false,
    category: 'intermediate',
    points: 50,
  },
  {
    id: '4',
    name: 'Consistency King',
    description: 'Complete at least one task every weekday for a week',
    icon: <IconMedal className="h-12 w-12" />,
    isUnlocked: false,
    category: 'intermediate',
    points: 75,
  },
  {
    id: '5',
    name: 'Century Club',
    description: 'Complete 100 total tasks',
    icon: <IconTrophy className="h-12 w-12" />,
    isUnlocked: false,
    category: 'intermediate',
    points: 100,
  },
  {
    id: '6',
    name: 'Perfectionist',
    description: 'Complete 25 tasks without a single late submission',
    icon: <IconSparkles className="h-12 w-12" />,
    isUnlocked: false,
    category: 'advanced',
    points: 150,
  },
  {
    id: '7',
    name: 'On Fire',
    description: 'Maintain a 5-day weekday streak of task completion for a month',
    icon: <IconFlame className="h-12 w-12" />,
    isUnlocked: false,
    category: 'advanced',
    points: 200,
  },
  {
    id: '8',
    name: 'Elite Achiever',
    description: 'Reach the top 3 on a organization leaderboard',
    icon: <IconAward className="h-12 w-12" />,
    isUnlocked: false,
    category: 'advanced',
    points: 250,
  },
  {
    id: '9',
    name: 'Legendary',
    description: 'Complete 1000 total tasks',
    icon: <IconTrophy className="h-12 w-12" />,
    isUnlocked: false,
    category: 'legendary',
    points: 500,
  },
];

export default async function AchievementsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in?callbackUrl=/achievements');
  }

  const userId = session.session?.userId;
  const organizationId = session.session?.activeOrganizationId ?? '';

  if (!userId || !organizationId) {
    redirect('/sign-in?callbackUrl=/achievements');
  }

  // Fetch user's points (available for future use)
  // const userPoints = await db
  //   .select()
  //   .from(userPointsTable)
  //   .where(eq(userPointsTable.userId, userId));

  // Check all achievements
  const unlockedAchievements = await checkAllAchievements(userId);

  const achievements = allAchievements.map((achievement) => {
    const unlockedInfo = unlockedAchievements.find(a => a.id === achievement.id);

    return {
      ...achievement,
      isUnlocked: unlockedInfo?.unlocked ?? false,
      unlockDate: unlockedInfo?.unlockedAt?.toISOString(),
    };
  });

  return <AchievementsPageClient achievements={achievements} />;
}
