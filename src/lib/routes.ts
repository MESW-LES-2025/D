import type { ReadonlyURLSearchParams } from 'next/navigation';

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/leaderboard',
  // Add more as you add to middleware matcher
] as const;

export const getCallbackURL = (
  queryParams: ReadonlyURLSearchParams,
): string => {
  const callbackUrl = queryParams.get('callbackUrl') || queryParams.get('returnTo');

  if (callbackUrl) {
    const isAllowedRoute = PROTECTED_ROUTES.some(route =>
      callbackUrl.startsWith(route),
    );

    // Also allow accept-invitation routes
    const isAcceptInvitation = callbackUrl.startsWith('/accept-invitation/');

    if (isAllowedRoute || isAcceptInvitation) {
      return callbackUrl;
    }

    console.warn('Invalid callbackUrl detected:', callbackUrl);
  }

  return PROTECTED_ROUTES[0];
};
