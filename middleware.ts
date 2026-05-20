import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/admin', '/employee'];
const authPaths = ['/admin/login'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('vd_token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '') || '';
  
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPaths.some((path) => pathname.startsWith(path));

  if (!token && isProtected && !isAuthPage) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/employee/:path*'],
};
