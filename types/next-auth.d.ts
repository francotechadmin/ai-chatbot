import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role?: 'user' | 'admin' | 'superuser';
    status?: 'active' | 'inactive' | 'pending';
    lastActive?: Date;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
