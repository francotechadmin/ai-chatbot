import { NextResponse } from 'next/server';
import { getAllArticles, searchArticles } from '@/lib/articles';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');

    let articles = getAllArticles();

    // Filter by category if specified
    if (category) {
      articles = articles.filter(
        (article) => article.frontmatter.category === category,
      );
    }

    // Search if query is provided
    if (query) {
      articles = searchArticles(query);
    }

    // Convert to the format expected by the frontend
    const formattedArticles = articles.map((article) => ({
      id: article.slug,
      title: article.frontmatter.title,
      summary: article.frontmatter.summary,
      category: article.frontmatter.category,
      readTime: article.frontmatter.readTime,
    }));

    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 },
    );
  }
}
