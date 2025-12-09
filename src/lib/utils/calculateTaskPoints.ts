'use server';

import type { Difficulty, Priority, Status } from '@/lib/task/task-types';
import { calculateDueDateMultiplier } from '@/lib/utils/pointCalculator';

/**
 * Calculate task points using the formula:
 * points = priority * difficulty * dueDateMultiplier / assigneeCount
 * 
 * Priority multipliers: low=10, medium=20, high=30, urgent=40
 * Difficulty multipliers: easy=10, medium=20, hard=30
 * Due date multiplier: sigmoid function (0.5 to 2.0)
 * Assignee count: defaults to 1 if 0 to avoid division by zero
 */
export async function calculateTaskPoints(
  priority: Priority,
  difficulty: Difficulty,
  dueDate: Date | null | undefined,
  assigneeCount: number,
  status: Status,
): Promise<number> {
  // Only calculate points for done tasks
  if (status !== 'done') {
    return 0;
  }

  // Get priority multiplier
  const priorityMap: Record<Priority, number> = {
    low: 10,
    medium: 20,
    high: 30,
    urgent: 40,
  };
  const priorityMultiplier = priorityMap[priority] || 20;

  // Get difficulty multiplier
  const difficultyMap: Record<Difficulty, number> = {
    easy: 10,
    medium: 20,
    hard: 30,
  };
  const difficultyMultiplier = difficultyMap[difficulty] || 20;

  // Get due date multiplier (sigmoid function)
  const dueDateMultiplier = calculateDueDateMultiplier(dueDate, new Date());

  // Default to 1 assignee if count is 0 to avoid division by zero
  const count = assigneeCount > 0 ? assigneeCount : 1;

  // Calculate final points: priority * difficulty * dueDateMultiplier / assigneeCount
  const points = (priorityMultiplier * difficultyMultiplier * dueDateMultiplier) / count;

  // Return as integer
  return Math.round(points);
}
