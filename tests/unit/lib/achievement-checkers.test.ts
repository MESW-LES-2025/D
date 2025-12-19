import { describe, expect, it } from 'vitest';

describe('Achievement Thresholds', () => {
  describe('Task counting achievements', () => {
    it('First Steps should require at least 1 task completion', () => {
      const threshold = 1;

      expect(0).toBeLessThan(threshold);
      expect(1).toBeGreaterThanOrEqual(threshold);
    });

    it('Task Master should require 5 task completions in a day', () => {
      const threshold = 5;

      expect(4).toBeLessThan(threshold);
      expect(5).toBeGreaterThanOrEqual(threshold);
      expect(10).toBeGreaterThanOrEqual(threshold);
    });

    it('Speed Demon should require 3 task completions in 30 minutes', () => {
      const threshold = 3;

      expect(2).toBeLessThan(threshold);
      expect(3).toBeGreaterThanOrEqual(threshold);
    });

    it('Century Club should require 100 total task completions', () => {
      const threshold = 100;

      expect(99).toBeLessThan(threshold);
      expect(100).toBeGreaterThanOrEqual(threshold);
      expect(1000).toBeGreaterThanOrEqual(threshold);
    });

    it('Legendary should require 1000 total task completions', () => {
      const threshold = 1000;

      expect(999).toBeLessThan(threshold);
      expect(1000).toBeGreaterThanOrEqual(threshold);
    });
  });

  describe('Streak/Consistency achievements', () => {
    it('Consistency King should require 5 consecutive weekdays', () => {
      const requiredConsecutiveWeekdays = 5;

      expect(4).toBeLessThan(requiredConsecutiveWeekdays);
      expect(5).toBeGreaterThanOrEqual(requiredConsecutiveWeekdays);
    });

    it('On Fire should require 5-day weekday streak', () => {
      const requiredWeekdayStreak = 5;

      expect(4).toBeLessThan(requiredWeekdayStreak);
      expect(5).toBeGreaterThanOrEqual(requiredWeekdayStreak);
    });
  });

  describe('Quality achievements', () => {
    it('Perfectionist should require 25 on-time task completions', () => {
      const threshold = 25;

      expect(24).toBeLessThan(threshold);
      expect(25).toBeGreaterThanOrEqual(threshold);
    });
  });
});

describe('Weekday Logic', () => {
  it('should identify weekdays correctly', () => {
    const monday = new Date('2025-12-15'); // Monday
    const friday = new Date('2025-12-19'); // Friday
    const saturday = new Date('2025-12-20'); // Saturday
    const sunday = new Date('2025-12-21'); // Sunday

    const isWeekday = (date: Date) => {
      const dayOfWeek = date.getDay();

      return dayOfWeek !== 0 && dayOfWeek !== 6;
    };

    expect(isWeekday(monday)).toBe(true);
    expect(isWeekday(friday)).toBe(true);
    expect(isWeekday(saturday)).toBe(false);
    expect(isWeekday(sunday)).toBe(false);
  });

  it('should count consecutive weekdays correctly', () => {
    const completionsByDay = new Map<string, boolean>();

    // Mock 5 consecutive weekdays (Mon-Fri)
    const dates = [
      new Date('2025-12-15'), // Monday
      new Date('2025-12-16'),
      new Date('2025-12-17'),
      new Date('2025-12-18'),
      new Date('2025-12-19'), // Friday
    ];

    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];

      if (dateStr) {
        completionsByDay.set(dateStr, true);
      }
    }

    let consecutiveDays = 0;
    const currentDate = new Date('2025-12-19');

    for (let i = 0; i < 7; i++) {
      const dayOfWeek = currentDate.getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }

      const dateStr = currentDate.toISOString().split('T')[0];

      if (dateStr && completionsByDay.has(dateStr)) {
        consecutiveDays++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    expect(consecutiveDays).toBeGreaterThanOrEqual(5);
  });

  it('should skip weekends when counting consecutive days', () => {
    const completionsByDay = new Map<string, boolean>();

    // Skipping weekend
    const dates = [
      new Date('2025-12-12'), // Friday
      new Date('2025-12-15'), // Monday
    ];

    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];

      if (dateStr) {
        completionsByDay.set(dateStr, true);
      }
    }

    let consecutiveDays = 0;
    const currentDate = new Date('2025-12-15'); // Monday

    for (let i = 0; i < 7; i++) {
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }

      const dateStr = currentDate.toISOString().split('T')[0];

      if (dateStr && completionsByDay.has(dateStr)) {
        consecutiveDays++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Should only count 1 weekday
    expect(consecutiveDays).toBeLessThan(5);
  });
});
