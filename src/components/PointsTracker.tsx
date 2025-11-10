'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type PointsTrackerProps = {
  currentPoints: number;
  totalPoints: number;
};

export default function PointsTracker({ currentPoints, totalPoints }: PointsTrackerProps) {
  // Calculate rocket position as a percentage (0-100), capped at 100
  const progressPercent = Math.min(totalPoints > 0 ? (currentPoints / totalPoints) * 100 : 0, 100);

  return (
    <section aria-labelledby="points-tracker-heading" className="sticky top-8 space-y-4">
      <div>
        <h3 id="points-tracker-heading" className="text-lg font-semibold">Points Tracker</h3>
        <p className="text-sm text-muted-foreground">Complete tasks to reach the moon!</p>
      </div>

      {/* Vertical rocket journey visualization (sidebar) */}
      <div className="rounded-lg border border-input bg-card p-4 space-y-4">
        
        {/* Vertical rocket path with moon at top */}
        <div className="relative w-full h-96 rounded-md border border-dashed border-primary/30 bg-gradient-to-t from-blue-500/5 to-blue-900/10 flex flex-col justify-between p-3">
          {/* Moon at the top */}
          <div className="flex justify-center pt-2">
            <div className="text-4xl animate-pulse">🌙</div>
          </div>

          {/* Rocket path line (vertical) */}
          <div className="absolute left-1/2 top-12 bottom-3 -translate-x-1/2 w-1 bg-gradient-to-t from-blue-400/20 to-blue-600/20" />

          {/* Animated rocket - moves from bottom to top */}
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-out"
            style={{ bottom: `${progressPercent}%`, top: 'auto' }}
          >
            <div className="text-3xl animate-bounce">🚀</div>
          </div>
        </div>

        {/* Current points display */}
        <div className="rounded-md bg-primary/10 p-3 text-center">
          <div className="text-2xl font-bold text-primary">
            {currentPoints}
            <span className="text-sm text-muted-foreground ml-1">/ {totalPoints}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalPoints > 0 && progressPercent < 100
              ? `${totalPoints - currentPoints} pts to go`
              : progressPercent >= 100
                ? '🎉 Moon reached!'
                : 'Start tasks!'}
          </p>
        </div>

        {/* Progress bar with scale */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
            <span>0</span>
            <span>{Math.round(totalPoints / 2)}</span>
            <span>{totalPoints}</span>
          </div>

          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Milestone badges */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { label: '25%', points: Math.round(totalPoints * 0.25) },
            { label: '50%', points: Math.round(totalPoints * 0.5) },
            { label: '100%', points: totalPoints },
          ].map((milestone) => {
            const isReached = currentPoints >= milestone.points;
            return (
              <div
                key={milestone.label}
                className={cn(
                  'rounded p-2 text-center border text-xs',
                  isReached
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-muted border-input text-muted-foreground'
                )}
              >
                <div className="font-semibold">{milestone.label}</div>
                <div className="opacity-75">{milestone.points}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
