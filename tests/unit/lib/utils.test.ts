import { describe, expect, it } from 'vitest';
import { cn, createSlug, getInitials } from '@/lib/utils';

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
