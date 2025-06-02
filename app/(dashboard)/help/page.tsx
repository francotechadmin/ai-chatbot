import { Suspense } from 'react';
import { PageHeader } from '@/components/page-header';
import { EnhancedHelpPage } from './components/enhanced-help-page';
import { getAllArticles } from '@/lib/articles';

// Server component that loads articles and renders the enhanced help page
export default async function HelpPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categories?: string;
    tags?: string;
    difficulty?: string;
    featured?: string;
    sortBy?: string;
  }>;
}) {
  // Load all articles from the file system
  const articles = getAllArticles();

  return (
    <div>
      <div className="container mx-auto p-6">
        <PageHeader title="Help Center" />
      </div>

      <Suspense
        fallback={
          <div className="container mx-auto p-6">
            <div className="h-96 bg-muted/20 animate-pulse rounded-lg" />
          </div>
        }
      >
        <EnhancedHelpPage initialArticles={articles} />
      </Suspense>
    </div>
  );
}
