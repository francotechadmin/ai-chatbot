import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Article, ArticleFrontmatter } from '@/content/help';

const articlesDirectory = path.join(process.cwd(), 'content/help');

export function getArticleSlugs(): string[] {
  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const files = fs.readdirSync(articlesDirectory);
  return files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      frontmatter: data as ArticleFrontmatter,
      content,
    };
  } catch (error) {
    console.error(`Error reading article ${slug}:`, error);
    return null;
  }
}

export function getAllArticles(): Article[] {
  const slugs = getArticleSlugs();
  const articles = slugs
    .map((slug) => getArticleBySlug(slug))
    .filter((article): article is Article => article !== null)
    .sort((a, b) => {
      // Sort by order if specified, then by category, then by title
      const aOrder = a.frontmatter.order ?? 999;
      const bOrder = b.frontmatter.order ?? 999;

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      if (a.frontmatter.category !== b.frontmatter.category) {
        return a.frontmatter.category.localeCompare(b.frontmatter.category);
      }

      return a.frontmatter.title.localeCompare(b.frontmatter.title);
    });

  return articles;
}

export function getArticlesByCategory(category: string): Article[] {
  return getAllArticles().filter(
    (article) => article.frontmatter.category === category,
  );
}

export function getFeaturedArticles(): Article[] {
  return getAllArticles().filter(
    (article) => article.frontmatter.featured === true,
  );
}

export function searchArticles(query: string): Article[] {
  const allArticles = getAllArticles();
  const searchTerm = query.toLowerCase();

  return allArticles.filter((article) => {
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

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const allArticles = getAllArticles();
  const currentSlug = article.slug;
  const currentCategory = article.frontmatter.category;
  const currentTags = article.frontmatter.tags || [];

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
      if (a.frontmatter.difficulty === article.frontmatter.difficulty) {
        score += 3;
      }

      return { article: a, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);

  return scoredArticles;
}

// Moved generateTableOfContents and estimateReadTime to lib/content-utils.ts
// to avoid Node.js dependencies in client components
