'use client';

import { useSession } from 'next-auth/react';
import { hasRole } from '@/lib/rbac';
import type { Role } from '@/lib/rbac';
import { ReactNode } from 'react';

interface RoleGateProps {
  children: ReactNode;
  requiredRole: Role;
}

/**
 * A component that conditionally renders its children based on the user's role
 * @param children The content to render if the user has the required role
 * @param requiredRole The minimum role required to view the content
 */
export function RoleGate({ children, requiredRole }: RoleGateProps) {
  const { data: session } = useSession();
  
  if (!hasRole(session, requiredRole)) {
    return null;
  }
  
  return <>{children}</>;
}
