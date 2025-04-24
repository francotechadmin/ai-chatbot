import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { hasRole } from '@/lib/rbac';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/api/auth', '/pending-approval'];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    
    const session = await auth();
    
    // Check if user is authenticated for all protected routes
    if (!session?.user) {
      console.log(`Unauthenticated access attempt to ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      // Add the current path as a redirect parameter
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Role-based access control for specific routes
    
    // Admin-only routes
    if (pathname.startsWith('/users') || pathname.startsWith('/knowledge-base/manage')) {
      if (!hasRole(session, 'admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    
    // Superuser-only routes
    if (pathname.startsWith('/settings/system')) {
      if (!hasRole(session, 'superuser')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  } catch (error) {
    console.error('Error in middleware:', error);
    // In case of error, redirect to login for safety
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes that don't need auth, and auth routes
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
