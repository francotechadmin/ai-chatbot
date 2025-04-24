import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/dashboard',
    error: '/login',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Define public paths that don't require authentication
      const isPublicPath = 
        nextUrl.pathname === '/login' || 
        nextUrl.pathname === '/register' || 
        nextUrl.pathname === '/pending-approval' ||
        nextUrl.pathname.startsWith('/api/auth');
      
      // If the user is logged in and trying to access a public path, redirect to dashboard
      if (isLoggedIn && isPublicPath) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      
      // If the user is not logged in and trying to access a protected path, deny access
      // The middleware will handle the redirect to login
      if (!isLoggedIn && !isPublicPath) {
        return false;
      }
      
      // Allow access otherwise
      return true;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
} satisfies NextAuthConfig;
