import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    // Basic guard placeholder; real check should verify Supabase session server-side
    const hasToken = req.cookies.get('sb-access-token');
    if (!hasToken) {
      const url = new URL('/auth/login', req.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};