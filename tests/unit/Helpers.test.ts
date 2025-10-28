import { describe, expect, it } from 'vitest';
import { getBaseUrl, isServer } from '../../src/utils/helpers';

describe('Helpers', () => {
  describe('getBaseUrl', () => {
    it('should return NEXT_PUBLIC_APP_URL when available', () => {
      const originalEnv = process.env.NEXT_PUBLIC_APP_URL;
      process.env.NEXT_PUBLIC_APP_URL = 'https://myapp.com';

      const result = getBaseUrl();

      expect(result).toBe('https://myapp.com');

      // Restore original value
      process.env.NEXT_PUBLIC_APP_URL = originalEnv;
    });

    it('should return Vercel production URL when in production', () => {
      const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
      const originalVercelEnv = process.env.VERCEL_ENV;
      const originalProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

      // Clear NEXT_PUBLIC_APP_URL to test fallback
      delete process.env.NEXT_PUBLIC_APP_URL;
      process.env.VERCEL_ENV = 'production';
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'myapp-production.vercel.app';

      const result = getBaseUrl();

      expect(result).toBe('https://myapp-production.vercel.app');

      // Restore original values
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
      process.env.VERCEL_ENV = originalVercelEnv;
      process.env.VERCEL_PROJECT_PRODUCTION_URL = originalProductionUrl;
    });

    it('should return Vercel URL when available', () => {
      const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
      const originalVercelEnv = process.env.VERCEL_ENV;
      const originalProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
      const originalVercelUrl = process.env.VERCEL_URL;

      // Clear other env vars to test this fallback
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.VERCEL_ENV;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      process.env.VERCEL_URL = 'myapp-preview.vercel.app';

      const result = getBaseUrl();

      expect(result).toBe('https://myapp-preview.vercel.app');

      // Restore original values
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
      process.env.VERCEL_ENV = originalVercelEnv;
      process.env.VERCEL_PROJECT_PRODUCTION_URL = originalProductionUrl;
      process.env.VERCEL_URL = originalVercelUrl;
    });

    it('should return localhost as fallback', () => {
      const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
      const originalVercelEnv = process.env.VERCEL_ENV;
      const originalProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
      const originalVercelUrl = process.env.VERCEL_URL;

      // Clear all env vars to test fallback
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.VERCEL_ENV;
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_URL;

      const result = getBaseUrl();

      expect(result).toBe('http://localhost:3000');

      // Restore original values
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
      process.env.VERCEL_ENV = originalVercelEnv;
      process.env.VERCEL_PROJECT_PRODUCTION_URL = originalProductionUrl;
      process.env.VERCEL_URL = originalVercelUrl;
    });
  });

  describe('isServer', () => {
    it('should return true when window is undefined (server-side)', () => {
      // In a Node.js test environment, window should be undefined
      const result = isServer();

      expect(result).toBe(true);
    });

    it('should return false when window is defined (client-side)', () => {
      // Mock window being defined
      const originalWindow = globalThis.window;
      // @ts-expect-error - mocking global window
      globalThis.window = {};

      const result = isServer();

      expect(result).toBe(false);

      // Restore original window
      globalThis.window = originalWindow;
    });
  });
});
