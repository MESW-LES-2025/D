import { ReadonlyURLSearchParams } from 'next/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getCallbackURL } from '@/lib/routes';

describe('getCallbackURL', () => {
  // Mock console.warn to suppress warnings during tests
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

  afterEach(() => {
    consoleWarnSpy.mockClear();
  });

  it('should return /dashboard when no callbackUrl is provided', () => {
    const params = new ReadonlyURLSearchParams({});
    const result = getCallbackURL(params);

    expect(result).toBe('/dashboard');
  });

  it('should return /dashboard when callbackUrl is in allowed set', () => {
    const params = new ReadonlyURLSearchParams({ callbackUrl: '/dashboard' });
    const result = getCallbackURL(params);

    expect(result).toBe('/dashboard');
  });

  it('should return /dashboard when callbackUrl is not in allowed set', () => {
    const params = new ReadonlyURLSearchParams({ callbackUrl: '/admin' });
    const result = getCallbackURL(params);

    expect(result).toBe('/dashboard');
  });

  it('should return /dashboard for potentially malicious callback URLs', () => {
    const params = new ReadonlyURLSearchParams({ callbackUrl: 'https://evil.com' });
    const result = getCallbackURL(params);

    expect(result).toBe('/dashboard');
  });

  it('should return /dashboard for relative paths not in allowed set', () => {
    const params = new ReadonlyURLSearchParams({ callbackUrl: '/settings' });
    const result = getCallbackURL(params);

    expect(result).toBe('/dashboard');
  });

  it('should return /dashboard for empty callbackUrl', () => {
    const params = new ReadonlyURLSearchParams({ callbackUrl: '' });
    const result = getCallbackURL(params);

    expect(result).toBe('/dashboard');
  });

  it('should handle multiple query parameters', () => {
    const params = new ReadonlyURLSearchParams({
      callbackUrl: '/dashboard',
      otherParam: 'value',
    });
    const result = getCallbackURL(params);

    expect(result).toBe('/dashboard');
  });
});
