import { describe, expect, it } from 'vitest';

import { calculatePointsWithTimingBonus, getPointsExplanation } from '@/lib/utils/pointCalculator';

describe('pointCalculator', () => {
  describe('calculatePointsWithTimingBonus', () => {
    const baseScore = 20; // Medium difficulty

    it('should return full points if no due date', () => {
      const result = calculatePointsWithTimingBonus(baseScore, null);

      expect(result).toBe(20);
    });

    it('should return half points if completed after due date', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      // due date is yesterday, completing today = 1 day late
      const result = calculatePointsWithTimingBonus(baseScore, yesterday, today);

      expect(result).toBe(10); // 20 * 0.5
    });

    it('should apply logarithmic bonus for early completion', () => {
      // Due in 7 days, completed today (7 days remaining)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const result = calculatePointsWithTimingBonus(baseScore, dueDate, new Date());

      // 20 * (1 + log2(7)) = 20 * 3.807... = 76.14... ≈ 76
      expect(result).toBe(76);
    });

    it('should give full points on due date (0 days remaining)', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const result = calculatePointsWithTimingBonus(baseScore, today, today);

      // 20 * 1 = 20 (no bonus on due date)
      expect(result).toBe(20);
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
      // completionDate is today, due is tomorrow, so 1 day remaining
      const result = calculatePointsWithTimingBonus(baseScore, dueDate, completionDate);

      // 20 * (1 + log2(1)) = 20 * 1 = 20
      expect(result).toBe(20);
    });

    it('should handle different base scores', () => {
      const due = new Date();
      due.setDate(due.getDate() + 3);

      // Easy task (10 pts)
      const easyResult = calculatePointsWithTimingBonus(10, due, new Date());
      // 10 * (1 + log2(3)) = 10 * 2.584... ≈ 26

      // Hard task (30 pts)
      const hardResult = calculatePointsWithTimingBonus(30, due, new Date());
      // 30 * (1 + log2(3)) = 30 * 2.584... ≈ 78

      expect(easyResult).toBe(26);
      expect(hardResult).toBe(78);
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
      expect(explanation).toContain('10');
    });

    it('should explain early completion with bonus', () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      const explanation = getPointsExplanation(baseScore, dueDate, new Date());

      expect(explanation).toContain('days before due date');
      expect(explanation).toContain('multiplier');
    });
  });
});
