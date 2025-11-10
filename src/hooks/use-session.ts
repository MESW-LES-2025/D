'use client';

import { client } from '@/lib/auth/auth-client';

/**
 * Custom hook for account components that need session data
 * Provides consistent loading states across all account cards
 */
export function useSession() {
  const { data: session, isPending, error } = client.useSession();

  return {
    user: session?.user,
    session,
    isLoading: isPending,
    isAuthenticated: !!session?.user,
    error,
  };
}
