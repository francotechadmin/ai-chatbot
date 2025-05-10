import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ToolsLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header Skeleton */}
        <PageHeader title="Import/Export Tools">
        </PageHeader>
        
        {/* Main Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Import Knowledge Skeleton */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="space-y-4">
                {/* Drag and drop area */}
                <div className="border border-dashed rounded-lg p-4 md:p-8 flex flex-col items-center justify-center">
                  <Skeleton className="size-8 rounded-full mb-4" />
                  <Skeleton className="h-4 w-64 mb-4" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-3 w-72 mt-2" />
                </div>
                
                {/* Import Settings */}
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 md:p-6 md:pt-0">
              <Skeleton className="h-9 w-full" />
            </div>
          </Card>

          {/* Export Knowledge Skeleton */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-4">
              {/* Export Format */}
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              
              {/* Content Selection */}
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center">
                    <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              
              {/* Export Settings */}
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 md:p-6 md:pt-0">
              <Skeleton className="h-9 w-full" />
            </div>
          </Card>
        </div>
        
        {/* Additional Tools Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4 md:p-6">
                <Skeleton className="h-6 w-40 mb-1" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex justify-center">
                  <Skeleton className="size-8 rounded-full" />
                </div>
              </CardContent>
              <div className="p-4 pt-0 md:p-6 md:pt-0">
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
        
        {/* Knowledge Stats Skeleton */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="hidden md:block">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="md:hidden space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Skeleton className="h-4 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}