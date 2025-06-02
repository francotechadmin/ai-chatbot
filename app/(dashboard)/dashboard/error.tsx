'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="size-6 text-destructive" />
            <CardTitle>Dashboard Error</CardTitle>
          </div>
          <CardDescription>
            There was a problem loading the dashboard data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {error.message || 'An error occurred while loading the dashboard.'}
          </p>
          <p className="text-sm text-muted-foreground">
            This could be due to a database connection issue or a temporary
            service disruption.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
