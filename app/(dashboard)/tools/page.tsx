import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { hasRole } from '@/lib/rbac';
import { ProtectedRoute } from '@/components/protected-route';
import { PageHeader } from '@/components/page-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileUploader } from './components/file-uploader';

export default async function ToolsPage() {
  try {
    // Check authentication and authorization on the server
    const session = await auth();

    if (!session || !hasRole(session, 'user')) {
      redirect('/login');
    }

    return (
      <ProtectedRoute requiredRole="user">
        <div className="container mx-auto p-6">
          <div className="flex flex-col gap-6">
            <PageHeader title="Import Tool" />

            {/* Import Knowledge */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle>Import Knowledge</CardTitle>
                <CardDescription>
                  Add content to your knowledge base from external sources
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                <div className="space-y-4">
                  {/* File Uploader - Client Component */}
                  <Suspense
                    fallback={
                      <div className="h-64 bg-muted/20 animate-pulse rounded-lg" />
                    }
                  >
                    <FileUploader />
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Error in ToolsPage:', error);
    throw error; // This will be caught by the error.tsx boundary
  }
}
