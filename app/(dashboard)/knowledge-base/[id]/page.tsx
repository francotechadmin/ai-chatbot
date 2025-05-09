'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, CheckCircle, XCircle, Edit, Trash, MessageSquare } from 'lucide-react';
import { formatDistance, format } from 'date-fns';
import { KnowledgeSource, KnowledgeChunk } from '@/lib/db/schema';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/protected-route';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function KnowledgeSourceDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <KnowledgeSourceDetailContent params={params} />
    </ProtectedRoute>
  );
}

function KnowledgeSourceDetailContent({ params }: { params: { id: string } }) {
  const [source, setSource] = useState<KnowledgeSource | null>(null);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchKnowledgeSource = async () => {
      try {
        const response = await fetch(`/api/knowledge-base/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setSource(data.source);
          setChunks(data.chunks || []);
        } else {
          toast.error('Failed to load knowledge source');
          router.push('/knowledge-base');
        }
      } catch (error) {
        console.error('Error fetching knowledge source:', error);
        toast.error('Failed to load knowledge source');
        router.push('/knowledge-base');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeSource();
  }, [params.id, router]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/knowledge-base/${params.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Knowledge source deleted successfully');
        router.push('/knowledge-base');
      } else {
        toast.error('Failed to delete knowledge source');
      }
    } catch (error) {
      console.error('Error deleting knowledge source:', error);
      toast.error('Failed to delete knowledge source');
    }
    
    setShowDeleteDialog(false);
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/knowledge-base/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      });
      
      if (response.ok) {
        const updatedSource = await response.json();
        setSource(updatedSource);
        toast.success('Knowledge source approved');
      } else {
        toast.error('Failed to approve knowledge source');
      }
    } catch (error) {
      console.error('Error approving knowledge source:', error);
      toast.error('Failed to approve knowledge source');
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/knowledge-base/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });
      
      if (response.ok) {
        const updatedSource = await response.json();
        setSource(updatedSource);
        toast.success('Knowledge source rejected');
      } else {
        toast.error('Failed to reject knowledge source');
      }
    } catch (error) {
      console.error('Error rejecting knowledge source:', error);
      toast.error('Failed to reject knowledge source');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/3 mb-8"></div>
          
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Knowledge source not found</h3>
          <p className="text-muted-foreground mt-2">
            The knowledge source you are looking for does not exist or has been deleted.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/knowledge-base')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Knowledge Base
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/knowledge-base')}
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Knowledge Base
        </Button>
        
        <div className="flex justify-between items-start">
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
          
          <div className="flex gap-2">
            {source.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleApprove}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleReject}
                >
                  <XCircle size={16} className="mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push(`/query/new?sourceId=${source.id}`)}
            >
              <MessageSquare size={16} className="mr-2" />
              Query
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash size={16} className="mr-2" />
              Delete
            </Button>
          </div>
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
          {chunks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No chunks found</h3>
              <p className="text-muted-foreground mt-2">
                This knowledge source does not have any chunks.
              </p>
            </div>
          ) : (
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
          )}
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
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              knowledge source and all associated chunks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
