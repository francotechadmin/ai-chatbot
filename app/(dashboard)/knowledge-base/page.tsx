'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Plus, Search, Filter, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { formatDistance } from 'date-fns';
import { KnowledgeSource } from '@/lib/db/schema';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function KnowledgeBasePage() {
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchKnowledgeSources = async () => {
      try {
        const response = await fetch('/api/knowledge-base');
        if (response.ok) {
          const data = await response.json();
          setKnowledgeSources(data);
        } else {
          toast.error('Failed to load knowledge sources');
        }
      } catch (error) {
        console.error('Error fetching knowledge sources:', error);
        toast.error('Failed to load knowledge sources');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKnowledgeSources();
  }, []);

  // Filter knowledge sources based on search query and active tab
  const filteredSources = knowledgeSources.filter(source => {
    // Filter by search query
    const matchesSearch = source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (source.description && source.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by tab
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'pending') return matchesSearch && source.status === 'pending';
    if (activeTab === 'approved') return matchesSearch && source.status === 'approved';
    if (activeTab === 'rejected') return matchesSearch && source.status === 'rejected';
    
    return matchesSearch;
  });

  // Get counts for each status
  const pendingCount = knowledgeSources.filter(source => source.status === 'pending').length;
  const approvedCount = knowledgeSources.filter(source => source.status === 'approved').length;
  const rejectedCount = knowledgeSources.filter(source => source.status === 'rejected').length;

  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Knowledge Base">
        <Button onClick={() => router.push('/capture/chat/new')}>
          <Plus size={16} className="mr-2" />
          New Capture
        </Button>
      </PageHeader>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search knowledge base..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="all">
              All ({knowledgeSources.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <KnowledgeSourceGrid sources={filteredSources} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-0">
            <KnowledgeSourceGrid 
              sources={filteredSources.filter(source => source.status === 'pending')} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="approved" className="mt-0">
            <KnowledgeSourceGrid 
              sources={filteredSources.filter(source => source.status === 'approved')} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-0">
            <KnowledgeSourceGrid 
              sources={filteredSources.filter(source => source.status === 'rejected')} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function KnowledgeSourceGrid({ sources, isLoading }: { sources: KnowledgeSource[], isLoading: boolean }) {
  const router = useRouter();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </CardContent>
            <CardFooter>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (sources.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No knowledge sources found</h3>
        <p className="text-muted-foreground mt-2">
          Start by capturing knowledge or uploading documents.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map((source) => (
        <Card 
          key={source.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/knowledge-base/${source.id}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{source.title}</CardTitle>
              {source.status === 'pending' && <Clock size={18} className="text-yellow-500" />}
              {source.status === 'approved' && <CheckCircle size={18} className="text-green-500" />}
              {source.status === 'rejected' && <XCircle size={18} className="text-red-500" />}
            </div>
            <CardDescription>
              {source.sourceType.charAt(0).toUpperCase() + source.sourceType.slice(1)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-2">
              {source.description || 'No description provided'}
            </p>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Added {formatDistance(new Date(source.createdAt), new Date(), { addSuffix: true })}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
