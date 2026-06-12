import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('vd_token')?.value;
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  const authRoutes = ['/admin/login', '/admin/login/forgot'];
  const isAdminRoute = pathname.startsWith('/admin') && !authRoutes.some(r => pathname.startsWith(r));
  const isEmployeeRoute = pathname.startsWith('/employee');

  if ((isAdminRoute || isEmployeeRoute) && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin') loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (request.nextUrl.protocol === 'https:') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|api/).*)'],
};
