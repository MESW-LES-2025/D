/**
 * Calculate bonus/penalty points based on task completion timing relative to due date
 *
 * Scoring rules:
 * - If task is completed on or before the last day: full points (baseScore)
 * - If task is completed after due date: half points (baseScore * 0.5)
 * - If task is completed before due date: points * logarithmic multiplier based on days remaining
 */
export function calculatePointsWithTimingBonus(
  baseScore: number,
  dueDate: Date | null | undefined,
  completionDate: Date = new Date(),
): number {
  // If no due date, return full points
  if (!dueDate) {
    return baseScore;
  }

  // Validate and convert dates - ensure they are valid Date objects
  let due: Date;
  let completion: Date;

  try {
    // Convert to Date if needed and validate
    due = dueDate instanceof Date ? dueDate : new Date(dueDate);
    completion = completionDate instanceof Date ? completionDate : new Date(completionDate);

    // Check if dates are valid
    if (Number.isNaN(due.getTime()) || Number.isNaN(completion.getTime())) {
      console.warn('Invalid date detected in calculatePointsWithTimingBonus, returning baseScore');
      return baseScore;
    }

    // Normalize dates to start of day for accurate comparison
    completion.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
  } catch (error) {
    console.error('Error parsing dates in calculatePointsWithTimingBonus:', error);
    return baseScore;
  }

  // Calculate days difference (positive = days remaining, negative = days overdue)
  const timeDiff = due.getTime() - completion.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Validate daysDiff is a valid number
  if (Number.isNaN(daysDiff)) {
    console.warn('daysDiff is NaN, returning baseScore');
    return baseScore;
  }

  // Case 1: Completed after due date (overdue) -> half points
  if (daysDiff < 0) {
    return Math.round(baseScore * 0.5);
  }

  // Case 2: Completed on the same day as due date -> full points
  if (daysDiff === 0) {
    return baseScore;
  }

  // Case 3: Completed before due date -> logarithmic bonus
  // Formula: baseScore * (1 + log2(daysRemaining))
  // This gives more points as days remaining increases
  const logMultiplier = 1 + Math.log2(daysDiff);
  const bonusPoints = Math.round(baseScore * logMultiplier);

  // Final validation - ensure result is a valid number
  if (Number.isNaN(bonusPoints)) {
    console.warn('bonusPoints is NaN, returning baseScore');
    return baseScore;
  }

  return bonusPoints;
}

export function getPointsExplanation(
  baseScore: number,
  dueDate: Date | null | undefined,
  completionDate: Date = new Date(),
): string {
  if (!dueDate) {
    return `No due date set. Full points awarded: ${baseScore} pts`;
  }

  const completion = new Date(completionDate);
  completion.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const timeDiff = due.getTime() - completion.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return `Completed ${Math.abs(daysDiff)} days late. Half points awarded: ${Math.round(baseScore * 0.5)} pts`;
  }

  if (daysDiff === 0) {
    return `Completed on the due date. Full points awarded: ${baseScore} pts`;
  }

  const logMultiplier = 1 + Math.log2(daysDiff);
  const bonusPoints = Math.round(baseScore * logMultiplier);

  return `Completed ${daysDiff} days before due date. Bonus multiplier: ${logMultiplier.toFixed(2)}x. Points awarded: ${bonusPoints} pts`;
}
