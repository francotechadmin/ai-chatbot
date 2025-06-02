import { NextResponse } from 'next/server';
import {
  getArticleBySlug,
  getRelatedArticles,
  getAllArticles,
} from '@/lib/articles';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const article = getArticleBySlug(slug);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Get related articles
    const relatedArticles = getRelatedArticles(article);

    // Get navigation articles
    const allArticles = getAllArticles();
    const currentIndex = allArticles.findIndex((a) => a.slug === slug);
    const previousArticle =
      currentIndex > 0 ? allArticles[currentIndex - 1] : null;
    const nextArticle =
      currentIndex < allArticles.length - 1
        ? allArticles[currentIndex + 1]
        : null;

    return NextResponse.json({
      article,
      relatedArticles,
      navigation: {
        previous: previousArticle,
        next: nextArticle,
      },
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 },
    );
  }
}
