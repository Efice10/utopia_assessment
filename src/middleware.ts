import { NextResponse, type NextRequest } from 'next/server';

import { createServerClient } from '@supabase/ssr';

// Protected route prefixes
const protectedRoutes = ['/orders', '/jobs', '/dashboard', '/team', '/projects', '/technicians', '/ai-assistant', '/account', '/audit-logs'];

// Locked routes - no access for anyone (but allow profile)
const lockedRoutes = ['/dashboard/settings'];
const lockedRoutesAllowlist = ['/dashboard/settings/profile'];

// Auth routes (redirect away if already logged in)
const authRoutes = ['/login', '/signup', '/forgot-password'];

// Routes that don't require password change check
const skipPasswordCheckRoutes = ['/change-password', '/api'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthenticated = !!user;

  // Locked routes - redirect to dashboard (but allow whitelisted routes)
  const isAllowlisted = lockedRoutesAllowlist.some((route) => pathname === route);
  const isLockedRoute = !isAllowlisted && lockedRoutes.some((route) => pathname.startsWith(route));
  if (isLockedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Root path redirect
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = isAuthenticated ? '/orders' : '/login';
    return NextResponse.redirect(url);
  }

  // Protected routes - require authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Check if user must change password (only for authenticated users on protected routes)
  if (isAuthenticated && isProtectedRoute) {
    // Check if this route should skip password check
    const shouldSkipPasswordCheck = skipPasswordCheckRoutes.some((route) =>
      pathname.startsWith(route)
    );

    if (!shouldSkipPasswordCheck) {
      // Check must_change_password cookie set by client
      const mustChangePasswordCookie = request.cookies.get('must_change_password');

      if (mustChangePasswordCookie?.value === 'true') {
        const url = request.nextUrl.clone();
        url.pathname = '/change-password';
        return NextResponse.redirect(url);
      }
    }
  }

  // Auth routes - redirect if already authenticated (but not if must change password)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && isAuthenticated) {
    const mustChangePasswordCookie = request.cookies.get('must_change_password');
    if (mustChangePasswordCookie?.value !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
