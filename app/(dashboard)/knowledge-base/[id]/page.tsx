import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { fetchKnowledgeSourceById } from '../actions';
import { SourceActions } from './components/source-actions';
import type { KnowledgeSource, KnowledgeChunk } from '@/lib/db/schema';
import { Suspense } from 'react';
import {
  KnowledgeSourceDetailSkeleton,
  KnowledgeChunksSkeleton,
  ErrorDisplay
} from '../components/loading-states';

export default async function KnowledgeSourceDetailPage({ 
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Check authentication
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user is admin
  if (session.user.role !== 'admin' && session.user.role !== 'superuser') {
    redirect('/dashboard');
  }

  // Resolve params
  const resolvedParams = await params;

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="outline"
        size="sm"
        asChild
      >
        <a href="/knowledge-base">
          <ArrowLeft size={16} className="mr-2" />
          Back to Knowledge Base
        </a>
      </Button>
      
      <Suspense fallback={<KnowledgeSourceDetailSkeleton />}>
        <KnowledgeSourceDetail id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}

// This component is wrapped in Suspense to handle loading states
async function KnowledgeSourceDetail({ id }: { id: string }) {
  // Fetch knowledge source and chunks
  let source: KnowledgeSource;
  let chunks: KnowledgeChunk[] = [];
  let error: string | null = null;
  
  try {
    const data = await fetchKnowledgeSourceById(id);
    source = data.source;
    chunks = data.chunks;
  } catch (err) {
    console.error('Error fetching knowledge source:', err);
    error = 'Failed to load knowledge source. Please try again later.';
    return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-2xl font-bold">{source.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">
                {source.sourceType.charAt(0).toUpperCase() + source.sourceType.slice(1)}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                Added {formatDistance(new Date(source.createdAt), new Date(), { addSuffix: true })}
              </span>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center">
                {source.status === 'pending' && (
                  <div className="flex items-center text-yellow-500">
                    <Clock size={16} className="mr-1" />
                    <span className="text-sm">Pending</span>
                  </div>
                )}
                {source.status === 'approved' && (
                  <div className="flex items-center text-green-500">
                    <CheckCircle size={16} className="mr-1" />
                    <span className="text-sm">Approved</span>
                  </div>
                )}
                {source.status === 'rejected' && (
                  <div className="flex items-center text-red-500">
                    <XCircle size={16} className="mr-1" />
                    <span className="text-sm">Rejected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <SourceActions source={source} />
        </div>
        
        {source.description && (
          <div className="mt-4 text-muted-foreground">
            {source.description}
          </div>
        )}
      </div>
      
      <Tabs defaultValue="chunks">
        <TabsList>
          <TabsTrigger value="chunks">Chunks ({chunks.length})</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chunks" className="mt-4">
          <Suspense fallback={<KnowledgeChunksSkeleton />}>
            <ChunksContent chunks={chunks} />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="metadata" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-auto">
                {JSON.stringify(source.metadata || {}, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

// Separate component for chunks to allow for independent loading
function ChunksContent({ chunks }: { chunks: KnowledgeChunk[] }) {
  if (chunks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">No chunks found</h3>
        <p className="text-muted-foreground mt-2">
          This knowledge source does not have any chunks.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {chunks.map((chunk) => (
        <Card key={chunk.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Chunk {chunk.metadata && typeof chunk.metadata === 'object' && 'chunkIndex' in chunk.metadata ? (chunk.metadata as any).chunkIndex + 1 : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{chunk.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
