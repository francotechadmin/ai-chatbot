import { Session } from 'next-auth';

export type Role = 'user' | 'admin' | 'superuser';

export const ROLE_HIERARCHY: Record<Role, number> = {
  user: 1,
  admin: 2,
  superuser: 3
};

/**
 * Check if a user has a specific role or higher
 * @param session The user's session
 * @param requiredRole The minimum role required
 * @returns True if the user has the required role or higher
 */
export function hasRole(session: Session | null, requiredRole: Role): boolean {
  if (!session || !session.user || !session.user.role) return false;
  
  const userRoleLevel = ROLE_HIERARCHY[session.user.role as Role] || 0;
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Check if a user is a superuser
 * @param session The user's session
 * @returns True if the user is a superuser
 */
export function isSuperuser(session: Session | null): boolean {
  return hasRole(session, 'superuser');
}

/**
 * Check if a user is an admin or higher
 * @param session The user's session
 * @returns True if the user is an admin or superuser
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, 'admin');
}

/**
 * Check if a user is a regular user or higher
 * @param session The user's session
 * @returns True if the user is logged in with any role
 */
export function isUser(session: Session | null): boolean {
  return hasRole(session, 'user');
}
