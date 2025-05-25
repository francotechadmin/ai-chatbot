'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('User page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || 'An error occurred while loading the users page.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}