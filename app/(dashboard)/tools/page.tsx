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
import { ImportSettings } from './components/import-settings';
import { ExportOptions } from './components/export-options';
import { AdditionalTools } from './components/additional-tools';
import { KnowledgeStats } from './components/knowledge-stats';

// Mock data for knowledge base statistics
const knowledgeStats = {
  totalSources: 128,
  totalChunks: 3542,
  pendingApproval: 7,
  lastUpdated: new Date().toLocaleString(),
};

// Default import settings
const defaultImportSettings = {
  autoCategorize: false,
  extractMetadata: true,
  removeDuplicates: true,
};

export default async function ToolsPage() {
  try {
    // Check authentication and authorization on the server
    const session = await auth();
    
    if (!session || !hasRole(session, 'user')) {
      redirect('/login');
    }
    
    // In a real implementation, you would fetch data from the database here
    // For example:
    // const knowledgeStats = await getKnowledgeBaseStats();
    
    return (
      <ProtectedRoute requiredRole="user">
        <div className="container mx-auto p-6">
          <div className="flex flex-col gap-6">
            <PageHeader title="Import/Export Tools">
            </PageHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                    <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-lg" />}>
                      <FileUploader />
                    </Suspense>
                    
                    {/* Import Settings - Client Component */}
                    <Suspense fallback={<div className="h-32 bg-muted/20 animate-pulse rounded-lg" />}>
                      <ImportSettings defaultSettings={defaultImportSettings} />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>

              {/* Export Knowledge */}
              <Card>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle>Export Knowledge</CardTitle>
                  <CardDescription>
                    Export your knowledge base for backup or transfer
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-4">
                  {/* Export Options - Client Component */}
                  <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-lg" />}>
                    <ExportOptions />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            {/* Additional Tools - Client Component */}
            <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-lg" />}>
              <AdditionalTools />
            </Suspense>

            {/* Knowledge Base Statistics - Client Component */}
            <Suspense fallback={<div className="h-64 bg-muted/20 animate-pulse rounded-lg" />}>
              <KnowledgeStats stats={knowledgeStats} />
            </Suspense>
          </div>
        </div>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Error in ToolsPage:', error);
    throw error; // This will be caught by the error.tsx boundary
  }
}