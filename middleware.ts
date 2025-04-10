import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import { hasAccess } from './lib/role';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token and get user data
    const userData = await verifyToken(token);
    
    if (!userData) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has access to the requested route
    if (!hasAccess(userData.role, pathname)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Add user info to headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user', JSON.stringify(userData));

    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
