import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import { hasAccess } from './lib/role';

// Define public routes that don't require authentication
const publicRoutes = ['/access-denied', '/login', '/signup', '/api/auth/login', '/api/classes', 'api/sections', '/api/session', '/api/classes', '/api/sections', '/api/session', '/images'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // No token found
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token and get user data
    const userData = await verifyToken(token);

    if (!userData) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check if user has access to the requested route
    if (!hasAccess(userData.role, pathname)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden', message: 'You do not have permission to access this resource' }, { status: 403 });
      }
      // Redirect to access denied page
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('user', JSON.stringify(userData));
    
    // For API routes, ensure Authorization header is set
    if (pathname.startsWith('/api/')) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }

    return NextResponse.next({
      headers: requestHeaders,
    });
  } catch (error) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)',
  ],
};
