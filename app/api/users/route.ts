import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { hasRole } from '@/lib/rbac';
import { getAllUsers, createActiveUser } from '@/lib/db/queries';

export async function GET() {
  const session = await auth();
  
  if (!hasRole(session, 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return new Response('Failed to fetch users', { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  // Only admins can create users
  if (!hasRole(session, 'admin')) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    const { email, password, role, status } = await request.json();
    
    // Validate required fields
    if (!email || !password) {
      return new Response('Email and password are required', { status: 400 });
    }
    
    // Validate role (only superusers can create admin/superuser accounts)
    if ((role === 'admin' || role === 'superuser') && !hasRole(session, 'superuser')) {
      return new Response('Only superusers can create admin or superuser accounts', { status: 403 });
    }
    
    // Create user with active status (admin-created users)
    await createActiveUser(email, password, role || 'user');
    
    // Get the newly created user
    const users = await getAllUsers();
    const newUser = users.find(user => user.email === email);
    
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return new Response('Failed to create user', { status: 500 });
  }
}
