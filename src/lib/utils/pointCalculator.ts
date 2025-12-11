/**
 * Calculate due date multiplier using sigmoid function for smooth transitions
 *
 * Multiplier rules:
 * - Sigmoid function ensures smooth transitions without extreme jumps
 * - Range: 0.5 (very late) to 2.0 (very early)
 * - Being 5 days late is worse than being 1 day late
 * - Formula: multiplier = 0.5 + 1.5 / (1 + e^(k * daysLate))
 *   where k = 0.3 (steepness parameter)
 *   and daysLate is positive when late, negative when early
 */
export function calculatePointsWithTimingBonus(
  basePoints: number,
  dueDate: Date | null | undefined,
  completionDate: Date = new Date(),
): number {
  const multiplier = calculateDueDateMultiplier(dueDate, completionDate);
  return Math.round(basePoints * multiplier);
}

/**
 * Calculate due date multiplier using sigmoid function for smooth transitions
 */
export function calculateDueDateMultiplier(
  dueDate: Date | null | undefined,
  completionDate: Date = new Date(),
): number {
  // If no due date, return neutral multiplier
  if (!dueDate) {
    return 1.0;
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
      console.warn('Invalid date detected in calculateDueDateMultiplier, returning 1.0');
      return 1.0;
    }

    // Normalize dates to start of day for accurate comparison
    completion.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
  } catch (error) {
    console.error('Error parsing dates in calculateDueDateMultiplier:', error);
    return 1.0;
  }

  // Calculate days difference (positive = days late, negative = days early)
  const timeDiff = completion.getTime() - due.getTime();
  const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Validate daysLate is a valid number
  if (Number.isNaN(daysLate)) {
    console.warn('daysLate is NaN, returning 1.0');
    return 1.0;
  }

  // Sigmoid function: multiplier = 0.5 + 1.5 / (1 + e^(k * daysLate))
  // k = 0.3 controls the steepness of the curve
  const k = 0.3;
  const multiplier = 0.5 + 1.5 / (1 + Math.exp(k * daysLate));

  // Final validation - ensure result is a valid number
  if (Number.isNaN(multiplier)) {
    console.warn('multiplier is NaN, returning 1.0');
    return 1.0;
  }

  return multiplier;
}

export function getPointsExplanation(
  multiplier: number,
  dueDate: Date | null | undefined,
  completionDate: Date = new Date(),
): string {
  if (!dueDate) {
    return `No due date set. Standard multiplier: ${multiplier.toFixed(2)}x`;
  }

  const completion = new Date(completionDate);
  completion.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const timeDiff = completion.getTime() - due.getTime();
  const daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysLate > 0) {
    return `Completed ${daysLate} days late. Multiplier: ${multiplier.toFixed(2)}x`;
  }

  if (daysLate === 0) {
    return `Completed on the due date. Multiplier: ${multiplier.toFixed(2)}x`;
  }

  const daysEarly = Math.abs(daysLate);
  return `Completed ${daysEarly} days before due date. Multiplier: ${multiplier.toFixed(2)}x`;
}
