import { describe, expect, it } from 'vitest';

// Helper functions for testing goal card logic
const getAvatarFallback = (name?: string) => {
  if (!name) {
    return '?';
  }
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const calculateDaysRemaining = (dueDate?: string) => {
  if (!dueDate) {
    return null;
  }
  const date = new Date(dueDate);
  const today = new Date();
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const isOverdue = (daysRemaining: number | null) => {
  return daysRemaining !== null && daysRemaining < 0;
};

const isUrgent = (daysRemaining: number | null) => {
  return daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
};

describe('Goal Card Utilities', () => {
  describe('getAvatarFallback', () => {
    it('should return two letter initials from full name', () => {
      expect(getAvatarFallback('John Doe')).toBe('JD');
    });

    it('should return two letter initials from three word name', () => {
      expect(getAvatarFallback('John Michael Doe')).toBe('JM');
    });

    it('should return single letter from single name', () => {
      expect(getAvatarFallback('Alice')).toBe('A');
    });

    it('should handle names with lowercase letters', () => {
      expect(getAvatarFallback('alice bob')).toBe('AB');
    });

    it('should handle names with mixed case', () => {
      expect(getAvatarFallback('AlIcE BoB')).toBe('AB');
    });

    it('should return ? for undefined name', () => {
      expect(getAvatarFallback(undefined)).toBe('?');
    });

    it('should return ? for empty string', () => {
      expect(getAvatarFallback('')).toBe('?');
    });

    it('should handle names with extra spaces', () => {
      expect(getAvatarFallback('  John   Doe  ')).toBe('JD');
    });

    it('should cap at 2 characters even with more than 2 names', () => {
      expect(getAvatarFallback('John Michael David Smith')).toBe('JM');
    });

    it('should handle single character names', () => {
      expect(getAvatarFallback('A B')).toBe('AB');
    });
  });

  describe('calculateDaysRemaining', () => {
    it('should return null for undefined dueDate', () => {
      expect(calculateDaysRemaining(undefined)).toBeNull();
    });

    it('should return 0 for today\'s date', () => {
      const today = new Date().toISOString().split('T')[0];
      const days = calculateDaysRemaining(today);

      expect(Math.abs(days || 0)).toBe(0);
    });

    it('should return positive number for future date', () => {
      const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
      const days = calculateDaysRemaining(futureDate);

      expect(days).toBeGreaterThan(0);
      expect(days).toBeGreaterThanOrEqual(9);
    });

    it('should return negative number for past date', () => {
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const days = calculateDaysRemaining(pastDate);

      expect(days).toBeLessThan(0);
    });

    it('should handle date strings correctly', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const days = calculateDaysRemaining(tomorrow);

      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThanOrEqual(2);
    });

    it('should round up when calculating days', () => {
      // 1 second into tomorrow
      const almostTomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000 + 1000).toISOString();
      const days = calculateDaysRemaining(almostTomorrow);

      expect(days).toBe(2);
    });
  });

  describe('isOverdue', () => {
    it('should return true for negative days remaining', () => {
      expect(isOverdue(-1)).toBe(true);
      expect(isOverdue(-5)).toBe(true);
      expect(isOverdue(-100)).toBe(true);
    });

    it('should return false for zero days remaining', () => {
      expect(isOverdue(0)).toBe(false);
    });

    it('should return false for positive days remaining', () => {
      expect(isOverdue(1)).toBe(false);
      expect(isOverdue(5)).toBe(false);
      expect(isOverdue(30)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isOverdue(null)).toBe(false);
    });
  });

  describe('isUrgent', () => {
    it('should return true for days 0-7', () => {
      expect(isUrgent(0)).toBe(true);
      expect(isUrgent(3)).toBe(true);
      expect(isUrgent(7)).toBe(true);
    });

    it('should return false for days > 7', () => {
      expect(isUrgent(8)).toBe(false);
      expect(isUrgent(14)).toBe(false);
      expect(isUrgent(30)).toBe(false);
    });

    it('should return false for negative days', () => {
      expect(isUrgent(-1)).toBe(false);
      expect(isUrgent(-5)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isUrgent(null)).toBe(false);
    });
  });

  describe('combined goal status scenarios', () => {
    it('should identify an overdue goal', () => {
      const daysRemaining = -3;

      expect(isOverdue(daysRemaining)).toBe(true);
      expect(isUrgent(daysRemaining)).toBe(false);
    });

    it('should identify an urgent goal (2 days left)', () => {
      const daysRemaining = 2;

      expect(isOverdue(daysRemaining)).toBe(false);
      expect(isUrgent(daysRemaining)).toBe(true);
    });

    it('should identify a normal goal (20 days left)', () => {
      const daysRemaining = 20;

      expect(isOverdue(daysRemaining)).toBe(false);
      expect(isUrgent(daysRemaining)).toBe(false);
    });

    it('should identify a goal due today', () => {
      const daysRemaining = 0;

      expect(isOverdue(daysRemaining)).toBe(false);
      expect(isUrgent(daysRemaining)).toBe(true);
    });
  });
});
