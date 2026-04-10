import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXACT_PUBLIC_PATHS = ['/'];
const PREFIX_PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public landing page, login, and register
  if (EXACT_PUBLIC_PATHS.includes(pathname) || PREFIX_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for tokens
  const token = request.cookies.get('subtrack_token')?.value;
  const refreshToken = request.cookies.get('subtrack_refresh')?.value;

  if (!token && !refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
