'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Star, Search } from 'lucide-react';
import type { SearchResponse, SearchResult } from '@/app/api/help/search/route';

interface EnhancedSearchResultsProps {
  searchResponse: SearchResponse | null;
  query: string;
}

function HighlightedText({
  text,
  className,
}: { text: string; className?: string }) {
  // Parse highlighted text with <mark> tags
  const parts = text.split(/(<mark>.*?<\/mark>)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('<mark>') && part.endsWith('</mark>')) {
          const content = part.slice(6, -7); // Remove <mark> and </mark>
          return (
            <mark
              key={part.slice(6, -7)}
              className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
            >
              {content}
            </mark>
          );
        }
        return part;
      })}
    </span>
  );
}

function SearchResultCard({
  result,
  query,
}: { result: SearchResult; query: string }) {
  const { article, highlights } = result;
  const { frontmatter } = article;

  return (
    <Link href={`/help/${article.slug}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1 line-clamp-2">
                {highlights.title ? (
                  <HighlightedText text={highlights.title} />
                ) : (
                  frontmatter.title
                )}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {frontmatter.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    frontmatter.difficulty === 'beginner'
                      ? 'border-green-500 text-green-700'
                      : frontmatter.difficulty === 'intermediate'
                        ? 'border-yellow-500 text-yellow-700'
                        : 'border-red-500 text-red-700'
                  }`}
                >
                  {frontmatter.difficulty}
                </Badge>
                {frontmatter.featured && (
                  <Badge variant="default" className="text-xs">
                    <Star className="size-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {highlights.summary ? (
                  <HighlightedText text={highlights.summary} />
                ) : (
                  frontmatter.summary
                )}
              </p>

              {/* Content Snippets */}
              {highlights.content && highlights.content.length > 0 && (
                <div className="space-y-1 mb-3">
                  {highlights.content.map((snippet, index) => (
                    <div
                      key={`snippet-${article.slug}-${index}`}
                      className="text-xs text-muted-foreground bg-muted/50 p-2 rounded"
                    >
                      <HighlightedText text={snippet} />
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              {frontmatter.tags && frontmatter.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {frontmatter.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {frontmatter.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{frontmatter.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                {frontmatter.readTime}
              </div>
              <div className="text-xs">
                Updated {new Date(frontmatter.lastUpdated).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function EnhancedSearchResults({
  searchResponse,
  query,
}: EnhancedSearchResultsProps) {
  if (!searchResponse) {
    return null;
  }

  const { results, totalCount } = searchResponse;

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Search className="mx-auto size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-4">
            {query ? (
              <>
                We couldn&apos;t find any articles matching &quot;{query}&quot;
              </>
            ) : (
              <>No articles match your current filters</>
            )}
          </p>
          <div className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters to find what you&apos;re
            looking for.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {query ? (
            <>
              Found <span className="font-medium">{totalCount}</span> result
              {totalCount !== 1 ? 's' : ''} for &apos;{query}&apos;
            </>
          ) : (
            <>
              Showing <span className="font-medium">{totalCount}</span> article
              {totalCount !== 1 ? 's' : ''}
            </>
          )}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.map((result) => (
          <SearchResultCard
            key={result.article.slug}
            result={result}
            query={query}
          />
        ))}
      </div>

      {/* Load More / Pagination could go here */}
      {results.length >= 10 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Showing first {results.length} results
          </p>
        </div>
      )}
    </div>
  );
}
