'use client';

import Link from 'next/link';
import type { Article } from '@/content/help';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeftIcon, ArrowUpIcon } from '@/components/icons';

interface ArticleNavigationProps {
  previousArticle: Article | null;
  nextArticle: Article | null;
}

export function ArticleNavigation({
  previousArticle,
  nextArticle,
}: ArticleNavigationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Previous Article */}
      <div>
        {previousArticle && (
          <Link href={`/help/${previousArticle.slug}`}>
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ArrowLeftIcon size={16} />
                  <span>Previous</span>
                </div>
                <h3 className="font-medium text-sm line-clamp-2">
                  {previousArticle.frontmatter.title}
                </h3>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {/* Back to Help Center */}
      <div className="flex justify-center">
        <Link href="/help">
          <Card className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                <ArrowUpIcon size={16} />
                <span>Back to</span>
              </div>
              <h3 className="font-medium text-sm">Help Center</h3>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Next Article */}
      <div>
        {nextArticle && (
          <Link href={`/help/${nextArticle.slug}`}>
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-4 text-right">
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                  <span>Next</span>
                  <div className="rotate-90">
                    <ArrowUpIcon size={16} />
                  </div>
                </div>
                <h3 className="font-medium text-sm line-clamp-2">
                  {nextArticle.frontmatter.title}
                </h3>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
