'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { WarningIcon, RefreshIcon } from '@/components/icons';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function QueryError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Query page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <WarningIcon size={20} />
            <CardTitle>Something went wrong</CardTitle>
          </div>
          <CardDescription>
            An error occurred while loading the query interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-[200px]">
            <p className="font-mono">{error.message || 'Unknown error occurred'}</p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
          <Button onClick={reset}>
            <span className="mr-2 flex items-center gap-2">
              <RefreshIcon size={16} />
              Try Again
            </span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}