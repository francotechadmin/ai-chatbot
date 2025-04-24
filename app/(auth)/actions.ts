'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';

import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data' | 'pending_approval';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    try {
      // First check if the user exists and has pending status
      const [user] = await getUser(validatedData.email);
      if (user && user.status === 'pending') {
        return { status: 'pending_approval' };
      }
      
      // Attempt to sign in
      await signIn('credentials', {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
      });
      
      return { status: 'success' };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if this is a pending approval error
      if (error.message && error.message === 'pending_approval') {
        return { status: 'pending_approval' };
      }
      
      // Other authentication errors
      return { status: 'failed' };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data'
    | 'pending_approval';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    
    // Create user with pending status
    await createUser(validatedData.email, validatedData.password);
    
    // Don't automatically sign in - account needs approval
    // Instead, return pending_approval status
    return { status: 'pending_approval' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};
