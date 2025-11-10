'use client';

import { useState } from 'react';
import TaskSimulator from '@/components/TaskSimulator';
import PointsTracker from '@/components/PointsTracker';

const TOTAL_POINTS = 10 + 20 + 10 + 20 + 30 + 30; // 120 total from 6 tasks

export default function TestPage() {
  const [currentPoints, setCurrentPoints] = useState(0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto py-12 px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-4 lg:items-start">
          {/* Tasks on the left (3 columns) */}
          <div className="lg:col-span-3">
            <TaskSimulator onPointsChange={setCurrentPoints} />
          </div>

          {/* Points tracker sidebar on the right (1 column) */}
          <div className="lg:col-span-1">
            <PointsTracker currentPoints={currentPoints} totalPoints={TOTAL_POINTS} />
          </div>
        </div>
      </div>
    </main>
  );
}
