import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Optimistic check - redirect if no session cookie found
  if (!sessionCookie) {
    const url = new URL('/sign-in', request.url);
    // Preserve the original path as callback URL
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
