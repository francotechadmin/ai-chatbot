'use client';

import { useState, } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedSearch } from './enhanced-search';
import { EnhancedSearchResults } from './enhanced-search-results';
import { CategoryFilter } from './category-filter';
import { EnhancedFAQ } from './enhanced-faq';
import { EnhancedContactSupport } from './enhanced-contact-support';
import type { SearchResponse } from '@/app/api/help/search/route';
import type { Article } from '@/content/help';
import {
  Search,
  Grid3X3,
  MessageCircle,
  Mail,
  BookOpen,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface EnhancedHelpPageProps {
  initialArticles: Article[];
}

export function EnhancedHelpPage({ initialArticles }: EnhancedHelpPageProps) {
  const searchParams = useSearchParams();
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null,
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('search');
  const [isLoading, setIsLoading] = useState(false);

  // Get initial query from URL
  const initialQuery = searchParams.get('q') || '';
  const initialCategories =
    searchParams.get('categories')?.split(',').filter(Boolean) || [];

  // useEffect(() => {
  //   if (initialCategories.length > 0) {
  //     setSelectedCategories(initialCategories);
  //   }
  // }, [initialCategories]);

  const handleSearchResults = (results: SearchResponse) => {
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  // Filter articles by selected categories
  const filteredArticles =
    selectedCategories.length > 0
      ? (initialArticles || []).filter((article) =>
          selectedCategories.includes(article.frontmatter.category),
        )
      : initialArticles || [];

  // Get featured articles
  const featuredArticles = (initialArticles || []).filter(
    (article) => article.frontmatter.featured,
  );

  // Get recent articles (last 30 days)
  const recentArticles = (initialArticles || [])
    .filter((article) => {
      const lastUpdated = new Date(article.frontmatter.lastUpdated);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastUpdated > thirtyDaysAgo;
    })
    .slice(0, 5);

  // Get popular categories
  const categoryStats = (initialArticles || []).reduce(
    (acc, article) => {
      const category = article.frontmatter.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const popularCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="size-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">
              {(initialArticles || []).length}
            </div>
            <div className="text-sm text-muted-foreground">Total Articles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="size-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{featuredArticles.length}</div>
            <div className="text-sm text-muted-foreground">Featured Guides</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="size-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{recentArticles.length}</div>
            <div className="text-sm text-muted-foreground">Recent Updates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Grid3X3 className="size-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {Object.keys(categoryStats).length}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="size-4" />
            Search & Browse
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <Grid3X3 className="size-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <MessageCircle className="size-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <Mail className="size-4" />
            Contact Support
          </TabsTrigger>
        </TabsList>

        {/* Search & Browse Tab */}
        <TabsContent value="search" className="space-y-6">
          <EnhancedSearch
            onSearchResults={handleSearchResults}
            initialQuery={initialQuery}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {searchResults ? (
                <EnhancedSearchResults
                  searchResponse={searchResults}
                  query={initialQuery}
                />
              ) : (
                <div className="space-y-6">
                  {/* Quick Access */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Quick Access
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featuredArticles.slice(0, 4).map((article) => (
                          <a
                            key={article.slug}
                            href={`/help/${article.slug}`}
                            className="block p-4 border rounded-lg hover:border-primary transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {article.frontmatter.title}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                Featured
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {article.frontmatter.summary}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {article.frontmatter.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {article.frontmatter.readTime}
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Updates */}
                  {recentArticles.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Recent Updates
                        </h3>
                        <div className="space-y-3">
                          {recentArticles.map((article) => (
                            <a
                              key={article.slug}
                              href={`/help/${article.slug}`}
                              className="block p-3 border rounded-lg hover:border-primary transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm mb-1">
                                    {article.frontmatter.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground">
                                    Updated{' '}
                                    {new Date(
                                      article.frontmatter.lastUpdated,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {article.frontmatter.category}
                                </Badge>
                              </div>
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Popular Categories */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Popular Categories</h4>
                  <div className="space-y-2">
                    {popularCategories.map(([category, count]) => (
                      <a
                        key={category}
                        href={`/help?categories=${category}`}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors"
                      >
                        <span className="text-sm capitalize">
                          {category.replace('-', ' ')}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {count}
                        </Badge>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">Quick Links</h4>
                  <div className="space-y-2">
                    <a
                      href="/help/welcome-to-knowledge-base"
                      className="block text-sm text-primary hover:underline"
                    >
                      → Welcome to Knowledge Base
                    </a>
                    <a
                      href="/help/getting-started-with-chats"
                      className="block text-sm text-primary hover:underline"
                    >
                      → Getting Started with Chats
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategoryFilter
            articles={initialArticles}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            showCounts={true}
          />

          {filteredArticles.length > 0 && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Articles{' '}
                  {selectedCategories.length > 0 &&
                    `in ${selectedCategories.join(', ')}`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArticles.map((article) => (
                    <a
                      key={article.slug}
                      href={`/help/${article.slug}`}
                      className="block p-4 border rounded-lg hover:border-primary transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-2 line-clamp-2">
                        {article.frontmatter.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {article.frontmatter.summary}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {article.frontmatter.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.frontmatter.readTime}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq">
          <EnhancedFAQ searchQuery={initialQuery} />
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <EnhancedContactSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
