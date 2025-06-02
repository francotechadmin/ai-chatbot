import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAllArticles, searchArticles } from '@/lib/articles';
import type { Article } from '@/content/help';

export interface SearchFilters {
  categories?: string[];
  tags?: string[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  featured?: boolean;
}

export interface SearchResult {
  article: Article;
  score: number;
  highlights: {
    title?: string;
    summary?: string;
    content?: string[];
  };
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  filters: {
    availableCategories: string[];
    availableTags: string[];
    availableDifficulties: string[];
  };
  suggestions: string[];
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi',
  );
  return text.replace(regex, '<mark>$1</mark>');
}

function getContentSnippets(
  content: string,
  query: string,
  maxSnippets = 3,
): string[] {
  if (!query.trim()) return [];

  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const queryLower = query.toLowerCase();

  const matchingSentences = sentences
    .filter((sentence) => sentence.toLowerCase().includes(queryLower))
    .slice(0, maxSnippets)
    .map((sentence) => {
      const trimmed = sentence.trim();
      if (trimmed.length > 150) {
        const queryIndex = trimmed.toLowerCase().indexOf(queryLower);
        const start = Math.max(0, queryIndex - 50);
        const end = Math.min(trimmed.length, queryIndex + query.length + 50);
        return `...${trimmed.slice(start, end)}...`;
      }
      return trimmed;
    });

  return matchingSentences;
}

function calculateSearchScore(article: Article, query: string): number {
  if (!query.trim()) return 0;

  const queryLower = query.toLowerCase();
  let score = 0;

  // Title match (highest weight)
  if (article.frontmatter.title.toLowerCase().includes(queryLower)) {
    score += 100;
  }

  // Summary match
  if (article.frontmatter.summary?.toLowerCase().includes(queryLower)) {
    score += 50;
  }

  // Tag match
  if (
    article.frontmatter.tags?.some((tag) =>
      tag.toLowerCase().includes(queryLower),
    )
  ) {
    score += 30;
  }

  // Category match
  if (article.frontmatter.category.toLowerCase().includes(queryLower)) {
    score += 20;
  }

  // Content match (lower weight but still valuable)
  const contentMatches = (
    article.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []
  ).length;
  score += contentMatches * 5;

  // Featured articles get a small boost
  if (article.frontmatter.featured) {
    score += 10;
  }

  return score;
}

function filterArticles(
  articles: Article[],
  filters: SearchFilters,
): Article[] {
  return articles.filter((article) => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(article.frontmatter.category)) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const articleTags = article.frontmatter.tags || [];
      if (!filters.tags.some((tag) => articleTags.includes(tag))) {
        return false;
      }
    }

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(article.frontmatter.difficulty)) {
        return false;
      }
    }

    // Featured filter
    if (filters.featured !== undefined) {
      if (article.frontmatter.featured !== filters.featured) {
        return false;
      }
    }

    return true;
  });
}

function getSearchSuggestions(query: string, articles: Article[]): string[] {
  if (!query.trim()) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  // Add tag suggestions
  articles.forEach((article) => {
    article.frontmatter.tags?.forEach((tag) => {
      if (
        tag.toLowerCase().includes(queryLower) &&
        tag.toLowerCase() !== queryLower
      ) {
        suggestions.add(tag);
      }
    });
  });

  // Add title word suggestions
  articles.forEach((article) => {
    const titleWords = article.frontmatter.title.toLowerCase().split(/\s+/);
    titleWords.forEach((word) => {
      if (word.includes(queryLower) && word !== queryLower && word.length > 3) {
        suggestions.add(word);
      }
    });
  });

  return Array.from(suggestions).slice(0, 5);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const categories =
      searchParams.get('categories')?.split(',').filter(Boolean) || [];
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const difficulty =
      (searchParams.get('difficulty')?.split(',').filter(Boolean) as (
        | 'beginner'
        | 'intermediate'
        | 'advanced'
      )[]) || [];
    const featured =
      searchParams.get('featured') === 'true'
        ? true
        : searchParams.get('featured') === 'false'
          ? false
          : undefined;
    const sortBy = searchParams.get('sortBy') || 'relevance'; // relevance, newest, alphabetical, popular

    const filters: SearchFilters = {
      categories: categories.length > 0 ? categories : undefined,
      tags: tags.length > 0 ? tags : undefined,
      difficulty: difficulty.length > 0 ? difficulty : undefined,
      featured,
    };

    // Get all articles
    let articles = getAllArticles();

    // Apply filters first
    articles = filterArticles(articles, filters);

    // Apply search if query exists
    if (query.trim()) {
      articles = searchArticles(query).filter(
        (article) => filterArticles([article], filters).length > 0,
      );
    }

    // Calculate search results with scores and highlights
    const searchResults: SearchResult[] = articles.map((article) => {
      const score = query.trim() ? calculateSearchScore(article, query) : 0;
      const highlights = query.trim()
        ? {
            title: article.frontmatter.title
              .toLowerCase()
              .includes(query.toLowerCase())
              ? highlightText(article.frontmatter.title, query)
              : undefined,
            summary: article.frontmatter.summary
              ?.toLowerCase()
              .includes(query.toLowerCase())
              ? highlightText(article.frontmatter.summary, query)
              : undefined,
            content: getContentSnippets(article.content, query),
          }
        : { content: [] };

      return {
        article,
        score,
        highlights,
      };
    });

    // Sort results
    searchResults.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.article.frontmatter.lastUpdated).getTime() -
            new Date(a.article.frontmatter.lastUpdated).getTime()
          );
        case 'alphabetical':
          return a.article.frontmatter.title.localeCompare(
            b.article.frontmatter.title,
          );
        case 'popular':
          // Featured articles first, then by order
          if (
            a.article.frontmatter.featured !== b.article.frontmatter.featured
          ) {
            return b.article.frontmatter.featured ? 1 : -1;
          }
          return (
            (a.article.frontmatter.order || 999) -
            (b.article.frontmatter.order || 999)
          );
        case 'relevance':
        default:
          return b.score - a.score;
      }
    });

    // Get filter options from all articles (not just filtered ones)
    const allArticles = getAllArticles();
    const availableCategories = [
      ...new Set(allArticles.map((a) => a.frontmatter.category)),
    ].sort();
    const availableTags = [
      ...new Set(allArticles.flatMap((a) => a.frontmatter.tags || [])),
    ].sort();
    const availableDifficulties = [
      ...new Set(allArticles.map((a) => a.frontmatter.difficulty)),
    ].sort();

    const suggestions = getSearchSuggestions(query, allArticles);

    const response: SearchResponse = {
      results: searchResults,
      totalCount: searchResults.length,
      filters: {
        availableCategories,
        availableTags,
        availableDifficulties,
      },
      suggestions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
