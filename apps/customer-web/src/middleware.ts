import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'access_token';
const PUBLIC_PATHS = ['/auth', '/callback', '/404', '/privacy', '/terms'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  const hasAuth = Boolean(request.cookies.get(AUTH_COOKIE)?.value);
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));

  if (isPublicPath) {
    return response;
  }

  if (!hasAuth) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
