'use server';

import type { Status } from '@/lib/task/task-types';
import { calculatePointsWithTimingBonus } from '@/lib/utils/pointCalculator';

export async function calculateTaskPoints(
  baseScore: number,
  status: Status,
  dueDate: Date | null | undefined,
): Promise<number> {
  // If marking as done, apply timing bonus/penalty
  if (status === 'done') {
    return calculatePointsWithTimingBonus(baseScore, dueDate, new Date());
  }

  // If not done, return base score
  return baseScore;
}

export async function getTaskBaseScore(difficulty: string): Promise<number> {
  const scoreMap: Record<string, number> = {
    easy: 10,
    medium: 20,
    hard: 30,
  };

  return scoreMap[difficulty] || 20; // Default to medium if unknown
}
