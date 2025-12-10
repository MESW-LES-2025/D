import { describe, expect, it } from 'vitest';

import { calculatePointsWithTimingBonus, getPointsExplanation } from '@/lib/utils/pointCalculator';

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

  describe('getPointsExplanation', () => {
    const baseScore = 20;

    it('should explain no due date scenario', () => {
      const explanation = getPointsExplanation(baseScore, null);

      expect(explanation).toContain('No due date');
      expect(explanation).toContain('20');
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
  });
});
