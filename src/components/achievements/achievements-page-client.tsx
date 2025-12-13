'use client';

import type React from 'react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

type AchievementsPageClientProps = {
  achievements: Achievement[];
};

export function AchievementsPageClient({ achievements }: AchievementsPageClientProps) {
  const filterAchievements = (category?: string) => {
    if (!category || category === 'all') {
      return achievements;
    }
    return achievements.filter(a => a.category === category);
  };

  // Show toast for newly unlocked achievements
  useEffect(() => {
    const unlockedAchievementIds = achievements
      .filter(a => a.isUnlocked)
      .map(a => a.id);

    const previouslyUnlockedStr = localStorage.getItem('unlockedAchievements');
    const previouslyUnlocked = previouslyUnlockedStr
      ? JSON.parse(previouslyUnlockedStr)
      : [];

    // Find newly unlocked achievements
    const newlyUnlocked = unlockedAchievementIds.filter(
      id => !previouslyUnlocked.includes(id),
    );

    // Show toast for each newly unlocked achievement
    newlyUnlocked.forEach((id) => {
      const achievement = achievements.find(a => a.id === id);
      if (achievement) {
        toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
          description: achievement.description,
        });
      }
    });

    // Update localStorage with current unlocked achievements
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievementIds));
  }, [achievements]);

  return (
    <div className="h-full flex-1 flex-col gap-8 px-8 py-4 md:flex">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Achievements & Badges
          </h2>
          <p className="text-muted-foreground">
            Unlock achievements, earn points, and showcase your progress
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:inline-grid lg:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="legendary">Legendary</TabsTrigger>
        </TabsList>

        {['all', 'beginner', 'intermediate', 'advanced', 'legendary'].map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filterAchievements(category === 'all' ? undefined : category).map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Card
      className={`group relative flex flex-col overflow-hidden transition-all hover:shadow-lg ${
        achievement.isUnlocked ? 'border-primary/50' : 'border-border'
      }`}
    >
      <CardHeader className="space-y-4 pb-4">
        <div className="flex justify-center">
          <div
            className={`rounded-lg p-3 transition-all ${achievement.isUnlocked ? 'bg-primary/10' : 'bg-muted'}`}
          >
            <div
              className={`transition-all ${achievement.isUnlocked ? 'text-[#D4AF37]' : 'text-muted-foreground'}`}
            >
              {achievement.icon}
            </div>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <CardTitle className="text-xl text-balance">{achievement.name}</CardTitle>
          <CardDescription className="text-sm text-pretty">{achievement.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex-1" />
        <div className="border-t border-border pt-4 pb-4">
          <div className="flex items-center justify-center">
            <span className={`text-sm ${achievement.isUnlocked ? 'text-muted-foreground' : 'font-medium text-muted-foreground'}`}>
              {achievement.isUnlocked && achievement.unlockDate
                ? new Date(achievement.unlockDate).toLocaleDateString()
                : 'Locked'}
            </span>
          </div>
        </div>
      </CardContent>
      {achievement.isUnlocked && (
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </Card>
  );
}
