'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function LoadingChat() {
  return (
    <div className="flex flex-col min-w-0 h-[calc(100vh-15rem)] md:h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-y-auto space-y-6 p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full max-w-[300px]" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full max-w-[200px]" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
      
      <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}