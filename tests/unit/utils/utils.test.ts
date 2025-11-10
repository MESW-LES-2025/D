import { describe, expect, it } from 'vitest';
import { getInitials } from '@/lib/utils';

describe('getInitials', () => {
  describe('valid names', () => {
    it('should return initials from first and last name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('should return initial from single name', () => {
      expect(getInitials('Madonna')).toBe('M');
    });

    it('should return only first 2 initials from three names', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });

    it('should return uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD');
    });

    it('should handle mixed case names', () => {
      expect(getInitials('JoHn DoE')).toBe('JD');
    });
  });

  describe('names with special characters', () => {
    it('should handle hyphenated first name', () => {
      expect(getInitials('Jean-Pierre Dubois')).toBe('JD');
    });

    it('should handle hyphenated last name', () => {
      expect(getInitials('John Smith-Jones')).toBe('JS');
    });

    it('should handle apostrophes', () => {
      expect(getInitials('Mary O\'Brien')).toBe('MO');
    });

    it('should handle names with spaces and hyphens', () => {
      expect(getInitials('Mary-Jane Van Der Berg')).toBe('MV');
    });
  });

  describe('names with extra whitespace', () => {
    it('should handle leading whitespace', () => {
      expect(getInitials('  John Doe')).toBe('JD');
    });

    it('should handle trailing whitespace', () => {
      expect(getInitials('John Doe  ')).toBe('JD');
    });

    it('should handle multiple spaces between names', () => {
      expect(getInitials('John   Doe')).toBe('JD');
    });

    it('should handle whitespace everywhere', () => {
      expect(getInitials('  John   Michael   Doe  ')).toBe('JM');
    });
  });

  describe('edge cases', () => {
    it('should return "?" for empty string', () => {
      expect(getInitials('')).toBe('?');
    });

    it('should return "?" for null', () => {
      expect(getInitials(null)).toBe('?');
    });

    it('should return "?" for undefined', () => {
      expect(getInitials(undefined)).toBe('?');
    });

    it('should return "?" for only whitespace', () => {
      expect(getInitials('   ')).toBe('?');
    });

    it('should handle single character name', () => {
      expect(getInitials('J')).toBe('J');
    });

    it('should limit to 2 initials for very long names', () => {
      expect(getInitials('Alexander Benjamin Christopher David')).toBe('AB');
    });

    it('should limit to 2 initials from names with suffixes', () => {
      expect(getInitials('John Doe 3rd')).toBe('JD');
    });

    it('should handle unicode characters', () => {
      expect(getInitials('José María')).toBe('JM');
    });

    it('should handle names with Jr/Sr suffixes', () => {
      expect(getInitials('John Doe Jr.')).toBe('JD');
    });

    it('should handle two-letter names', () => {
      expect(getInitials('Al Li')).toBe('AL');
    });

    it('should always return maximum 2 characters', () => {
      const result = getInitials('A B C D E F G');

      expect(result.length).toBeLessThanOrEqual(2);
      expect(result).toBe('AB');
    });
  });
});
