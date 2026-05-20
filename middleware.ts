import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('vd_token')?.value;
  const pathname = request.nextUrl.pathname;

  const publicRoutes = ['/', '/cottages', '/cafe', '/about', '/gallery', '/contact', '/policies', '/booking'];
  const authRoutes = ['/admin/login', '/admin/login/forgot'];

  const isAdminRoute = pathname.startsWith('/admin') && !authRoutes.some(r => pathname.startsWith(r));
  const isEmployeeRoute = pathname.startsWith('/employee');

  if ((isAdminRoute || isEmployeeRoute) && !token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*']
};
