'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Reusable loading hook for managing loading and error states
export function useLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setErrorMessage = (message: string) => {
    setError(message);
    setIsLoading(false);
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorMessage,
    resetState
  };
}

// Skeleton for knowledge source cards
export function KnowledgeSourceSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="h-6 bg-muted rounded w-3/4 mb-2" />
              <div className="size-4 bg-muted rounded-full" />
            </div>
            <div className="h-4 bg-muted rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </CardContent>
          <CardFooter>
            <div className="h-4 bg-muted rounded w-1/3" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Skeleton for knowledge source detail
export function KnowledgeSourceDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="my-6">
        <div className="h-8 bg-muted rounded w-1/4 mb-6" />
        <div className="h-6 bg-muted rounded w-1/2 mb-4" />
        <div className="h-4 bg-muted rounded w-1/3 mb-8" />
        
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton for knowledge chunks
export function KnowledgeChunksSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-5 bg-muted rounded w-1/4" />
          </CardHeader>
          <CardContent>
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Error display with retry option
interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="size-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{message}</p>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="w-fit"
          >
            <RefreshCcw className="mr-2 size-4" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Loading overlay for form submissions
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = "Loading..." }: LoadingOverlayProps) {
  if (!isLoading) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <div className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-center font-medium">{message}</p>
      </div>
    </div>
  );
}