import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/dashboard',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/dashboard', nextUrl as unknown as URL));
      }

      if (isOnRegister || isOnLogin) {
        return true; // Always allow access to register and login pages
      }

      // Redirect root path to dashboard for logged-in users
      if (nextUrl.pathname === '/') {
        if (isLoggedIn) {
          return Response.redirect(new URL('/dashboard', nextUrl as unknown as URL));
        }
        return false; // Redirect unauthenticated users to login page
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
