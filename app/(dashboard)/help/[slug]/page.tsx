import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { ArticleContent } from '../components/article-content';
import { ArticleNavigation } from '../components/article-navigation';
import { RelatedArticles } from '../components/related-articles';
import { EnhancedTableOfContents } from '../components/enhanced-table-of-contents';
import { ArticleBreadcrumbs } from '../components/article-breadcrumbs';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  const { title, summary, tags } = article.frontmatter;

  return {
    title: `${title} | Help Center`,
    description: summary,
    keywords: tags.join(', '),
    openGraph: {
      title: `${title} | Help Center`,
      description: summary,
      type: 'article',
      publishedTime: article.frontmatter.lastUpdated,
      tags: tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Help Center`,
      description: summary,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === slug);
  const previousArticle =
    currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : null;

  return (
    <div className="container mx-auto p-6">
      <div className="mx-auto">
        <ArticleBreadcrumbs article={article} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <ArticleContent article={article} />

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t">
              <ArticleNavigation
                previousArticle={previousArticle}
                nextArticle={nextArticle}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <EnhancedTableOfContents
                content={article.content}
                showReadingTime={true}
                showProgress={false}
                collapsible={true}
              />
              <RelatedArticles
                currentArticle={article}
                allArticles={allArticles}
                limit={4}
                showMoreLink={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
