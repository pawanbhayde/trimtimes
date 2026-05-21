import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // tt_session is a plain cookie we set from JS after login.
  // refresh_token is the httpOnly cookie set by the backend.
  const isAuthed =
    req.cookies.has('tt_session') || req.cookies.has('refresh_token');

  const { pathname } = req.nextUrl;

  const isShopDashboard = pathname.startsWith('/shop/');
  const isUserDashboard =
    pathname.startsWith('/user/') &&
    !pathname.startsWith('/user/login') &&
    !pathname.startsWith('/user/signup');
  const isAdminDashboard =
    pathname.startsWith('/admin/') &&
    !pathname.startsWith('/admin/login');

  if ((isShopDashboard || isUserDashboard || isAdminDashboard) && !isAuthed) {
    const loginUrl = isUserDashboard
      ? '/user/login'
      : isAdminDashboard
        ? '/admin/login'
        : '/login';
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/shop/:path*', '/user/:path*', '/admin/:path*'],
};
