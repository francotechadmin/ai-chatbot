import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { fetchKnowledgeSources } from './actions';
import { SearchFilter } from './components/search-filter';
import { StatusTabs } from './components/status-tabs';
import type { KnowledgeSource } from '@/lib/db/schema';
import { Suspense } from 'react';
import { KnowledgeSourceSkeleton, ErrorDisplay } from './components/loading-states';

export default async function KnowledgeBasePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
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

  // Get search query from URL params
  const params = await searchParams;
  const searchQuery = params?.search || '';

  return (
    <div className="container mx-auto p-6">
      <PageHeader title="Knowledge Base">
        <Button asChild>
          <a href="/capture/new">
            <Plus size={16} className="mr-2" />
            New Capture
          </a>
        </Button>
      </PageHeader>

      <div className="mb-6">
        <SearchFilter initialQuery={searchQuery} />
        <Suspense fallback={<KnowledgeSourceSkeleton />}>
          <KnowledgeBaseContent searchQuery={searchQuery} />
        </Suspense>
      </div>
    </div>
  );
}

// This component is wrapped in Suspense to handle loading states
async function KnowledgeBaseContent({ searchQuery }: { searchQuery: string }) {
  // Fetch knowledge sources
  let sources: KnowledgeSource[] = [];
  let error: string | null = null;
  
  try {
    sources = await fetchKnowledgeSources();
  } catch (err) {
    console.error('Error fetching knowledge sources:', err);
    error = 'Failed to load knowledge sources. Please try again later.';
  }

  // Filter sources based on search query
  const filteredSources = sources.filter(source => {
    return source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (source.description?.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return <StatusTabs sources={sources} filteredSources={filteredSources} />;
}
