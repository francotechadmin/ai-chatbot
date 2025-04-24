'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hasRole } from '@/lib/rbac';
import type { Role } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // If the session is loading, do nothing yet
    if (status === 'loading') return;
    
    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    
    // If a specific role is required, check if the user has it
    if (requiredRole && !hasRole(session, requiredRole)) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router, requiredRole]);
  
  // Show nothing while loading
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If authenticated and has required role (or no role required), render children
  if (status === 'authenticated' && (!requiredRole || hasRole(session, requiredRole))) {
    return <>{children}</>;
  }
  
  // Default case - don't render anything while redirecting
  return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
}
