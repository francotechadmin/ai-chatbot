'use client';

import Link from 'next/link';
import type { Article } from '@/content/help';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRelatedArticlesClient } from '@/lib/articles-client';
import { BookOpen, Star, Clock, ArrowRight } from 'lucide-react';

interface RelatedArticlesProps {
  currentArticle: Article;
  allArticles: Article[];
  limit?: number;
  showMoreLink?: boolean;
}

export function RelatedArticles({
  currentArticle,
  allArticles,
  limit = 3,
  showMoreLink = true,
}: RelatedArticlesProps) {
  const relatedArticles = getRelatedArticlesClient(
    currentArticle,
    allArticles,
    limit,
  );

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="size-5" />
          Related Articles
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Articles that might also interest you
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${article.slug}`}
            className="block"
          >
            <div className="p-3 rounded-lg border hover:border-primary transition-colors cursor-pointer group">
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors break-words">
                    {article.frontmatter.title}
                  </h4>
                </div>
                {article.frontmatter.featured && (
                  <Star className="size-4 text-yellow-500 shrink-0 " />
                )}
              </div>

              <p className="text-xs text-muted-foreground mb-3 line-clamp-2 break-words">
                {article.frontmatter.summary}
              </p>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {article.frontmatter.category}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      article.frontmatter.difficulty === 'beginner'
                        ? 'border-green-500 text-green-700'
                        : article.frontmatter.difficulty === 'intermediate'
                          ? 'border-yellow-500 text-yellow-700'
                          : 'border-red-500 text-red-700'
                    }`}
                  >
                    {article.frontmatter.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3 shrink-0 " />
                  <span className="truncate">
                    {article.frontmatter.readTime}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {article.frontmatter.tags &&
                article.frontmatter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.frontmatter.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground truncate max-w-20"
                        title={tag}
                      >
                        {tag}
                      </span>
                    ))}
                    {article.frontmatter.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{article.frontmatter.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
            </div>
          </Link>
        ))}

        {/* Show More Link */}
        {showMoreLink && (
          <div className="pt-3 border-t">
            <Link
              href={`/help?categories=${currentArticle.frontmatter.category}`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center"
              >
                <ArrowRight className="size-4 mr-2" />
                View more in {currentArticle.frontmatter.category}
              </Button>
            </Link>
          </div>
        )}

        {/* People Also Read */}
        {/* <div className="pt-3 border-t">
          <h5 className="text-sm font-medium mb-2 text-muted-foreground">
            People also read
          </h5>
          <div className="space-y-1">
            <Link
              href="/help/chatbot-getting-started"
              className="block text-xs text-primary hover:underline"
            >
              → Getting Started with Your AI Chatbot
            </Link>
            <Link
              href="/help/chat-features"
              className="block text-xs text-primary hover:underline"
            >
              → Chat Features & Capabilities
            </Link>
          </div>
        </div> */}
      </CardContent>
    </Card>
  );
}
