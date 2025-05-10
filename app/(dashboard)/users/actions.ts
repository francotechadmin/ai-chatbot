'use server';

import { auth } from '@/app/(auth)/auth';
import { getAllUsers, updateUser as dbUpdateUser, createActiveUser } from '@/lib/db/queries';
import { isAdmin } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

// Define user type to match database schema
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'superuser';
  status: 'active' | 'inactive' | 'pending';
  password: string | null;
  lastActive: Date | null;
  createdAt?: Date;
}

/**
 * Fetches all users from the database
 * Requires admin privileges
 * @returns Array of users
 */
export async function getUsers(): Promise<User[]> {
  console.log('getUsers: Starting to fetch users');
  
  try {
    // Get the current session
    console.log('getUsers: Getting auth session');
    const session = await auth();
    console.log('getUsers: Auth session obtained', { hasSession: !!session });

    // Check if the user is authenticated and has admin privileges
    if (!session || !isAdmin(session)) {
      console.log('getUsers: Unauthorized - not admin');
      throw new Error('Unauthorized: Admin privileges required');
    }

    try {
      // Fetch all users from the database
      console.log('getUsers: Fetching users from database');
      const users = await getAllUsers();
      console.log(`getUsers: Successfully fetched ${users.length} users`);
      return users;
    } catch (error) {
      console.error('Failed to fetch users from database:', error);
      throw new Error('Failed to fetch users from database');
    }
  } catch (error) {
    console.error('Error in getUsers function:', error);
    throw error; // Propagate the error to be caught by error boundary
  }
}

/**
 * Updates a user's role or status
 * Requires admin privileges
 * @param params Object containing id, role, and status
 * @returns Success message
 */
export async function updateUser({
  id,
  role,
  status,
}: {
  id: string;
  role?: 'user' | 'admin' | 'superuser';
  status?: 'active' | 'inactive' | 'pending';
}): Promise<{ success: boolean; message: string }> {
  // Get the current session
  const session = await auth();

  // Check if the user is authenticated and has admin privileges
  if (!session || !isAdmin(session)) {
    throw new Error('Unauthorized: Admin privileges required');
  }

  // Validate input
  if (!id) {
    throw new Error('User ID is required');
  }

  // Ensure at least one field to update is provided
  if (!role && !status) {
    throw new Error('At least one field (role or status) must be provided');
  }

  try {
    // Update the user in the database
    await dbUpdateUser({ id, role, status });

    // Revalidate the users page to reflect the changes
    revalidatePath('/dashboard/users');

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    console.error('Failed to update user:', error);
    throw new Error('Failed to update user');
  }
}

/**
 * Creates a new user with active status
 * Requires admin privileges
 * @param params Object containing email, password, and role
 * @returns The created user
 */
export async function createUser(params: {
  email: string;
  password: string;
  role?: 'user' | 'admin' | 'superuser';
}): Promise<User> {
  const { email, password, role = 'user' } = params;
  // Get the current session
  const session = await auth();

  // Check if the user is authenticated and has admin privileges
  if (!session || !isAdmin(session)) {
    throw new Error('Unauthorized: Admin privileges required');
  }

  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  try {
    // Create the user in the database with active status
    await createActiveUser(email, password, role);
    
    // Fetch the newly created user
    const users = await getAllUsers();
    const newUser = users.find(user => user.email === email);
    
    if (!newUser) {
      throw new Error('Failed to retrieve created user');
    }
    
    // Revalidate the users page to reflect the changes
    revalidatePath('/dashboard/users');
    
    return newUser;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
}