import type { Article } from '@/content/help';

// Client-safe article utilities that don't use Node.js modules
export function getRelatedArticlesClient(
  currentArticle: Article,
  allArticles: Article[],
  limit = 3,
): Article[] {
  const currentSlug = currentArticle.slug;
  const currentCategory = currentArticle.frontmatter.category;
  const currentTags = currentArticle.frontmatter.tags || [];

  // Score articles based on relevance
  const scoredArticles = allArticles
    .filter((a) => a.slug !== currentSlug)
    .map((a) => {
      let score = 0;

      // Same category gets higher score
      if (a.frontmatter.category === currentCategory) {
        score += 10;
      }

      // Shared tags get points
      const articleTags = a.frontmatter.tags || [];
      const sharedTags = articleTags.filter((tag) => currentTags.includes(tag));
      score += sharedTags.length * 5;

      // Same difficulty level gets points
      if (a.frontmatter.difficulty === currentArticle.frontmatter.difficulty) {
        score += 3;
      }

      // Featured articles get a small boost
      if (a.frontmatter.featured) {
        score += 2;
      }

      return { article: a, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);

  return scoredArticles;
}

export function searchArticlesClient(
  query: string,
  articles: Article[],
): Article[] {
  const searchTerm = query.toLowerCase();

  return articles.filter((article) => {
    const { title, summary, tags, category } = article.frontmatter;
    const { content } = article;

    return (
      title?.toLowerCase().includes(searchTerm) ||
      summary?.toLowerCase().includes(searchTerm) ||
      (tags &&
        Array.isArray(tags) &&
        tags.some((tag) => tag.toLowerCase().includes(searchTerm))) ||
      category?.toLowerCase().includes(searchTerm) ||
      content?.toLowerCase().includes(searchTerm)
    );
  });
}

export function getArticlesByCategoryClient(
  category: string,
  articles: Article[],
): Article[] {
  return articles.filter(
    (article) => article.frontmatter.category === category,
  );
}

export function getFeaturedArticlesClient(articles: Article[]): Article[] {
  return articles.filter((article) => article.frontmatter.featured === true);
}
