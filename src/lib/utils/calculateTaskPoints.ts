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
