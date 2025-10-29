import type { ReadonlyURLSearchParams } from 'next/navigation';

export const PROTECTED_ROUTES = [
  '/dashboard',
  // Add more as you add to middleware matcher
] as const;

export const getCallbackURL = (
  queryParams: ReadonlyURLSearchParams,
): string => {
  const callbackUrl = queryParams.get('callbackUrl');

  if (callbackUrl) {
    const isAllowedRoute = PROTECTED_ROUTES.some(route =>
      callbackUrl.startsWith(route),
    );

    if (isAllowedRoute) {
      return callbackUrl;
    }

    console.warn('Invalid callbackUrl detected:', callbackUrl);
  }

  return PROTECTED_ROUTES[0];
};
