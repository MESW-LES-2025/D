import { describe, expect, it } from 'vitest';
import { cn, createSlug, getInitials, timeAgo } from '@/lib/utils';

describe('cn', () => {
  it('should return an empty string when no inputs are provided', () => {
    expect(cn()).toBe('');
  });

  it('should merge class names correctly', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
    expect(cn(['class1', undefined, 'class2'])).toBe('class1 class2');
    expect(cn(['class1', false, 'class2'])).toBe('class1 class2');
    expect(cn(['class1', null, 'class2'])).toBe('class1 class2');
  });
});

describe('getInitials', () => {
  it('should return initials for a valid input', () => {
    expect(getInitials('John Doe')).toBe('JD');
    expect(getInitials('Jane')).toBe('J');
    expect(getInitials('')).toBe('?');
    expect(getInitials(null)).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });

  it('should handle extra spaces correctly', () => {
    expect(getInitials('  John   Doe  ')).toBe('JD');
  });
});

describe('createSlug', () => {
  it('should create a slug from a string', () => {
    expect(createSlug('Hello World')).toBe('hello-world');
    expect(createSlug('  Hello   World  ')).toBe('hello-world');
    expect(createSlug('Hello, World!')).toBe('hello-world');
    expect(createSlug('Hello---World')).toBe('hello-world');
  });

  it('should handle empty strings', () => {
    expect(createSlug('')).toBe('');
  });
});

describe('timeAgo', () => {
  it('should return "just now" for dates less than a second ago', () => {
    const now = new Date();

    expect(timeAgo(now)).toBe('just now');
  });

  it('should return relative time for dates within the last 7 days', () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const result = timeAgo(oneHourAgo);

    expect(result).toContain('hour');

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    expect(timeAgo(oneDayAgo)).toContain('day');
  });

  it('should return formated date for dates older than 7 days', () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const result = timeAgo(eightDaysAgo);

    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('should accept string and number inputs', () => {
    const dateString = new Date().toISOString();

    expect(timeAgo(dateString)).toBe('just now');

    const dateNumber = Date.now();

    expect(timeAgo(dateNumber)).toBe('just now');
  });

  it('should handle multiple time units correctly', () => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    expect(timeAgo(twoMinutesAgo)).toContain('minute');

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    expect(timeAgo(threeHoursAgo)).toContain('hour');
  });
});
