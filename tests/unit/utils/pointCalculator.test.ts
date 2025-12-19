import { describe, expect, it } from 'vitest';

import { calculateDueDateMultiplier, calculatePointsWithTimingBonus, getPointsExplanation } from '@/lib/utils/pointCalculator';

describe('pointCalculator', () => {
  describe('calculatePointsWithTimingBonus', () => {
    const baseScore = 20; // Medium difficulty

    it('should return full points if no due date', () => {
      const result = calculatePointsWithTimingBonus(baseScore, null);

      expect(result).toBe(20);
    });

    it('should return slightly more points (approx 1.25x) on due date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const result = calculatePointsWithTimingBonus(baseScore, today, today);

      // 20 * 1.25 = 25
      expect(result).toBe(25);
    });

    it('should return fewer points if completed after due date', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // due date is yesterday, completing today = 1 day late
      // daysLate = 1
      // multiplier = 0.5 + 1.5 / (1 + e^0.3) ≈ 1.138
      // points = 20 * 1.138 ≈ 22.7 -> 23
      const result = calculatePointsWithTimingBonus(baseScore, yesterday, today);

      expect(result).toBe(23);
    });

    it('should apply bonus for early completion', () => {
      // Due in 7 days, completed today (7 days early)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      // daysLate = -7
      // multiplier = 0.5 + 1.5 / (1 + e^-2.1) ≈ 1.838
      // points = 20 * 1.838 ≈ 36.7 -> 37
      const result = calculatePointsWithTimingBonus(baseScore, dueDate, new Date());

      expect(result).toBe(37);
    });

    it('should give more points for earlier completion', () => {
      const baseDate = new Date();
      const due = new Date(baseDate);
      due.setDate(due.getDate() + 10);

      // Completed 3 days early
      const earlyCompletion = new Date(baseDate);
      earlyCompletion.setDate(earlyCompletion.getDate() + 7);

      // Completed 1 day early
      const lessEarlyCompletion = new Date(baseDate);
      lessEarlyCompletion.setDate(lessEarlyCompletion.getDate() + 9);

      const earlyResult = calculatePointsWithTimingBonus(baseScore, due, earlyCompletion);
      const lessEarlyResult = calculatePointsWithTimingBonus(baseScore, due, lessEarlyCompletion);

      expect(earlyResult).toBeGreaterThan(lessEarlyResult);
    });

    it('should handle edge case: completed 1 day before due', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 1);
      const completionDate = new Date();
      // completionDate is today, due is tomorrow, so 1 day early (daysLate = -1)
      // multiplier = 0.5 + 1.5 / (1 + e^-0.3) ≈ 1.36
      // points = 20 * 1.36 = 27.2 -> 27
      const result = calculatePointsWithTimingBonus(baseScore, dueDate, completionDate);

      expect(result).toBe(27);
    });

    it('should handle different base scores', () => {
      const due = new Date();
      due.setDate(due.getDate() + 3);

      const easyResult = calculatePointsWithTimingBonus(10, due, new Date());

      const hardResult = calculatePointsWithTimingBonus(30, due, new Date());

      expect(easyResult).toBe(16);
      expect(hardResult).toBe(47);
    });
  });

  describe('calculateDueDateMultiplier', () => {
    it('should handle invalid date strings gracefully', () => {
      const result = calculateDueDateMultiplier(new Date('invalid-date'));

      expect(result).toBe(1.0);
    });

    it('should handle null/undefined dates', () => {
      expect(calculateDueDateMultiplier(null)).toBe(1.0);
      expect(calculateDueDateMultiplier(undefined)).toBe(1.0);
    });

    it('should handle invalid due date with valid completion date', () => {
      const invalidDate = new Date('not-a-date');
      const validDate = new Date();
      const result = calculateDueDateMultiplier(invalidDate, validDate);

      expect(result).toBe(1.0);
    });

    it('should handle valid due date with invalid completion date', () => {
      const validDate = new Date();
      const invalidDate = new Date('invalid');
      const result = calculateDueDateMultiplier(validDate, invalidDate);

      expect(result).toBe(1.0);
    });

    it('should handle both dates invalid', () => {
      const invalidDate1 = new Date('invalid-date');
      const invalidDate2 = new Date('also-invalid');
      const result = calculateDueDateMultiplier(invalidDate1, invalidDate2);

      expect(result).toBe(1.0);
    });

    it('should handle completion very late (10+ days)', () => {
      const due = new Date();
      const completion = new Date();
      completion.setDate(completion.getDate() + 15);

      const result = calculateDueDateMultiplier(due, completion);

      // Very late should be close to minimum multiplier (0.5)
      expect(result).toBeLessThan(0.6);
    });

    it('should handle completion very early (10+ days)', () => {
      const due = new Date();
      due.setDate(due.getDate() + 15);
      const completion = new Date();

      const result = calculateDueDateMultiplier(due, completion);

      // Very early should be close to maximum multiplier (2.0)
      expect(result).toBeGreaterThan(1.9);
    });

    it('should return exact 1.25x multiplier when completed on due date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = calculateDueDateMultiplier(today, today);

      expect(result).toBeCloseTo(1.25, 2);
    });
  });

  describe('getPointsExplanation', () => {
    const baseScore = 20;

    it('should explain no due date scenario', () => {
      const explanation = getPointsExplanation(baseScore, null);

      expect(explanation).toContain('No due date');
      expect(explanation).toContain('20');
    });

    it('should explain undefined due date scenario', () => {
      const explanation = getPointsExplanation(1.5, undefined);

      expect(explanation).toContain('No due date');
      expect(explanation).toContain('1.50');
    });

    it('should explain late completion scenario', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // due date is yesterday, completing today = 1 day late
      const explanation = getPointsExplanation(baseScore, yesterday, today);

      expect(explanation).toContain('late');
    });

    it('should explain early completion with bonus', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const explanation = getPointsExplanation(1.8, dueDate, new Date());

      expect(explanation).toContain('days before due date');
      // If we pass 1.8, it should contain 1.8
      expect(explanation).toContain('1.8');
    });

    it('should explain completion exactly on due date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const explanation = getPointsExplanation(1.25, today, today);

      expect(explanation).toContain('due date');
      expect(explanation).toContain('1.25');
    });

    it('should handle multiple days late', () => {
      const today = new Date();
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);

      const explanation = getPointsExplanation(0.6, threeWeeksAgo, today);

      expect(explanation).toContain('late');
      expect(explanation).toContain('21');
    });

    it('should handle multiple days early', () => {
      const today = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);

      const explanation = getPointsExplanation(1.9, dueDate, today);

      expect(explanation).toContain('before due date');
      expect(explanation).toContain('14');
    });

    it('should format multiplier with correct decimal places', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const explanation = getPointsExplanation(1.0, today, today);

      expect(explanation).toContain('1.00');
    });

    it('should handle 1 day late', () => {
      const dueDate = new Date();
      dueDate.setHours(0, 0, 0, 0);
      const completionDate = new Date(dueDate);
      completionDate.setDate(completionDate.getDate() + 1);

      const explanation = getPointsExplanation(1.15, dueDate, completionDate);

      expect(explanation).toContain('1 days late');
    });

    it('should handle 1 day early', () => {
      const completionDate = new Date();
      completionDate.setHours(0, 0, 0, 0);
      const dueDate = new Date(completionDate);
      dueDate.setDate(dueDate.getDate() + 1);

      const explanation = getPointsExplanation(1.35, dueDate, completionDate);

      expect(explanation).toContain('1 days before due date');
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should maintain reasonable multiplier range (0.5 to 2.0)', () => {
      const baseDate = new Date();

      // Test extreme past
      const farPast = new Date(baseDate);
      farPast.setDate(farPast.getDate() - 100);
      const pastResult = calculateDueDateMultiplier(farPast, baseDate);

      expect(pastResult).toBeGreaterThanOrEqual(0.5);
      expect(pastResult).toBeLessThanOrEqual(2.0);

      // Test extreme future
      const farFuture = new Date(baseDate);
      farFuture.setDate(farFuture.getDate() + 100);
      const futureResult = calculateDueDateMultiplier(farFuture, baseDate);

      expect(futureResult).toBeGreaterThanOrEqual(0.5);
      expect(futureResult).toBeLessThanOrEqual(2.0);
    });

    it('should handle timestamp-based dates', () => {
      const baseScore = 20;
      const dueTimestamp = new Date().getTime();
      const completionTimestamp = new Date().getTime();

      const result = calculatePointsWithTimingBonus(baseScore, new Date(dueTimestamp), new Date(completionTimestamp));

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(baseScore * 2);
    });

    it('should apply consistent scoring for same time difference', () => {
      const baseScore = 20;
      const baseDate = new Date();

      // First scenario: due today, complete tomorrow (1 day late)
      const due1 = new Date(baseDate);
      due1.setHours(0, 0, 0, 0);
      const complete1 = new Date(baseDate);
      complete1.setDate(complete1.getDate() + 1);
      complete1.setHours(0, 0, 0, 0);

      // Second scenario: due in 5 days, complete in 6 days (1 day late)
      const due2 = new Date(baseDate);
      due2.setDate(due2.getDate() + 5);
      due2.setHours(0, 0, 0, 0);
      const complete2 = new Date(baseDate);
      complete2.setDate(complete2.getDate() + 6);
      complete2.setHours(0, 0, 0, 0);

      const result1 = calculatePointsWithTimingBonus(baseScore, due1, complete1);
      const result2 = calculatePointsWithTimingBonus(baseScore, due2, complete2);

      expect(result1).toBe(result2);
    });

    it('should round points correctly', () => {
      const baseScore = 10;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2);

      const result = calculatePointsWithTimingBonus(baseScore, dueDate, new Date());

      expect(Number.isInteger(result)).toBe(true);
    });

    it('should handle small base scores with early completion', () => {
      const baseScore = 1;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 10);

      const result = calculatePointsWithTimingBonus(baseScore, dueDate, new Date());

      expect(result).toBeGreaterThan(0);
    });

    it('should handle large base scores', () => {
      const baseScore = 1000;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5);

      const result = calculatePointsWithTimingBonus(baseScore, dueDate, new Date());

      expect(result).toBeGreaterThan(baseScore * 0.5);
      expect(result).toBeLessThanOrEqual(baseScore * 2);
    });
  });
});
