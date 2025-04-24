import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { hasRole, Role } from '@/lib/rbac';
import { updateUser } from '@/lib/db/queries';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!hasRole(session, 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const { role, status } = await request.json();
    
    // Only superusers can promote to admin or superuser
    if ((role === 'admin' || role === 'superuser') && !hasRole(session, 'superuser')) {
      return new Response('Unauthorized - requires superuser', { status: 401 });
    }
    
    await updateUser({
      id: params.id,
      role: role as Role,
      status: status as 'active' | 'inactive' | 'pending'
    });
    
    return new Response('User updated', { status: 200 });
  } catch (error) {
    console.error('Failed to update user:', error);
    return new Response('Failed to update user', { status: 500 });
  }
}
