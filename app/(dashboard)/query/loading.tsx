import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { ClockRewind, PlusIcon } from '@/components/icons';

export default function QueryLoading() {
  return (
    <div className="container mx-auto p-2 md:p-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between items-start gap-4 md:flex-row md:items-center mb-4">
          <Skeleton className="h-8 w-40" />
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-[140px] md:w-auto">
              <Button variant="outline" className="w-full h-[34px] text-sm" disabled>
                <ClockRewind size={16} />
                <span className="ml-2">History</span>
              </Button>
            </div>
            <div className="shrink-0 w-[140px] md:w-auto">
              <Button variant="outline" className="w-full h-[34px] text-sm" disabled>
                <PlusIcon size={16} />
                <span className="ml-2">New Query</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col min-w-0 h-[calc(100vh-15rem)] md:h-[calc(100vh-8rem)]">
          <div className="flex-1 overflow-y-auto space-y-6 p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full max-w-[300px]" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
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
      </div>
    </div>
  );
}