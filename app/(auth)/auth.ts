import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser, updateUserLastActive } from '@/lib/db/queries';

import { authConfig } from './auth.config';
import { Role } from '@/lib/rbac';

interface ExtendedSession extends Session {
  user: User & { 
    id: string;
    role: string;
    status?: string;
    lastActive?: Date;
  };
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        try {
          console.log(`Attempting to authenticate user: ${email}`);
          const users = await getUser(email);
          
          if (users.length === 0) {
            console.log(`User not found: ${email}`);
            return null;
          }
          
          const user = users[0];
          
          // Check if user is active
          if (user.status !== 'active') {
            console.log(`User account not active: ${email}, status: ${user.status}`);
            
            // If status is pending, return a specific error that will be caught by the login page
            if (user.status === 'pending') {
              throw new Error('pending_approval');
            }
            
            return null;
          }
          
          // biome-ignore lint: Forbidden non-null assertion.
          const passwordsMatch = await compare(password, user.password!);
          
          if (!passwordsMatch) {
            console.log(`Password mismatch for user: ${email}`);
            return null;
          }
          
          // Update last active timestamp if not in Edge runtime
          if (user.id && typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
            try {
              await updateUserLastActive({ id: user.id });
            } catch (error) {
              console.error('Error updating last active timestamp during login:', error);
            }
          }
          
          console.log(`Authentication successful for user: ${email}, role: ${user.role || 'user'}`);
          return user as any;
        } catch (error) {
          console.error('Error in authorize callback:', error);
          
          // Re-throw pending_approval error so it can be caught by the login action
          if (error instanceof Error && error.message === 'pending_approval') {
            throw error;
          }
          
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.role = (user.role as Role) || 'user';
        token.status = user.status || 'active';
        token.email = user.email;
      } else if (trigger === 'update') {
        // Handle token updates if needed
        // This could be used to refresh user data
        try {
          if (token.email) {
            const users = await getUser(token.email as string);
            if (users.length > 0) {
              const freshUser = users[0];
              token.role = freshUser.role as Role;
              token.status = freshUser.status;
            }
          }
        } catch (error) {
          console.error('Error updating JWT token:', error);
        }
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.status = token.status;
        
        // Only update last active timestamp if not in Edge runtime
        if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME !== 'edge') {
          try {
            if (session.user.id) {
              await updateUserLastActive({ id: session.user.id });
            }
          } catch (error) {
            console.error('Error updating last active timestamp:', error);
          }
        }
      }

      return session;
    },
  },
});
