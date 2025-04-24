'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  // Handle URL parameters only once on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    
    if (error === 'pending') {
      toast({
        type: 'error',
        description: 'Your account is pending approval. Please wait for an administrator to approve your account.',
      });
    }
  }, []);

  // Handle form submission states
  useEffect(() => {
    if (state.status === 'failed') {
      toast({
        type: 'error',
        description: 'Invalid credentials!',
      });
    } else if (state.status === 'pending_approval') {
      toast({
        type: 'error',
        description: 'Your account is pending approval. Please wait for an administrator to approve your account.',
      });
    } else if (state.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (state.status === 'success') {
      toast({
        type: 'success',
        description: 'Logged in successfully!',
      });
      setIsSuccessful(true);
      
      // Use window.location instead of router.refresh() to avoid potential loops
      window.location.href = '/dashboard';
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
        
        {state.status === 'pending_approval' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-medium text-yellow-800">Account Pending Approval</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Your account has been created but requires administrator approval before you can access the system.
              You will be notified once your account has been approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
