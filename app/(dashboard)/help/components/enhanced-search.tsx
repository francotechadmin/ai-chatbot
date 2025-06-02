'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  Filter,
  X,
  Clock,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import type {
  SearchResponse,
  SearchFilters,
} from '@/app/api/help/search/route';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

interface EnhancedSearchProps {
  onSearchResults: (results: SearchResponse) => void;
  initialQuery?: string;
}

export function EnhancedSearch({
  onSearchResults,
  initialQuery = '',
}: EnhancedSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    'getting started',
    'chat features',
    'knowledge base',
    'troubleshooting',
    'API documentation',
  ]);
  const [availableFilters, setAvailableFilters] = useState({
    categories: [] as string[],
    tags: [] as string[],
    difficulties: [] as string[],
  });
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showDifficultyFilter, setShowDifficultyFilter] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('help-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setRecentSearches((prev) => {
      const updated = [
        searchQuery,
        ...prev.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      localStorage.setItem('help-recent-searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce(
        async (
          searchQuery: string,
          searchFilters: SearchFilters,
          sort: string,
        ) => {
          setIsLoading(true);
          try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('q', searchQuery);
            if (searchFilters.categories?.length)
              params.set('categories', searchFilters.categories.join(','));
            if (searchFilters.tags?.length)
              params.set('tags', searchFilters.tags.join(','));
            if (searchFilters.difficulty?.length)
              params.set('difficulty', searchFilters.difficulty.join(','));
            if (searchFilters.featured !== undefined)
              params.set('featured', searchFilters.featured.toString());
            if (sort !== 'relevance') params.set('sortBy', sort);

            const response = await fetch(`/api/help/search?${params}`);
            if (!response.ok) throw new Error('Search failed');

            const data: SearchResponse = await response.json();
            onSearchResults(data);
            setSuggestions(data.suggestions);
            setAvailableFilters({
              categories: data.filters.availableCategories,
              tags: data.filters.availableTags,
              difficulties: data.filters.availableDifficulties,
            });

            // Update URL
            const urlParams = new URLSearchParams(searchParams);
            if (searchQuery) {
              urlParams.set('q', searchQuery);
              saveRecentSearch(searchQuery);
            } else {
              urlParams.delete('q');
            }
            router.replace(`/help?${urlParams}`, { scroll: false });
          } catch (error) {
            console.error('Search error:', error);
          } finally {
            setIsLoading(false);
          }
        },
        300,
      ),
    [onSearchResults, router, searchParams, saveRecentSearch],
  );

  // Trigger search when query or filters change
  useEffect(() => {
    debouncedSearch(query, filters, sortBy);
    // Intentionally omitting debouncedSearch from deps to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters, sortBy]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSortBy('relevance');
  };

  const hasActiveFilters = Object.values(filters).some((value) =>
    Array.isArray(value) ? value.length > 0 : value !== undefined,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">
          How can we help you today?
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Search our knowledge base or browse by category
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => setShowSuggestions(query.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-4"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin size-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {/* Search Suggestions */}
          {showSuggestions && (
            <div className="absolute top-full inset-x-0 z-50 mt-1 bg-background border rounded-md shadow-lg">
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {recentSearches.length > 0 && (
                <>
                  <Separator />
                  <div className="p-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                      <Clock className="size-3" />
                      Recent Searches
                    </div>
                    {recentSearches.map((search) => (
                      <button
                        key={search}
                        type="button"
                        onClick={() => handleSuggestionClick(search)}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <Separator />
              <div className="p-2">
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-2">
                  <TrendingUp className="size-3" />
                  Popular Searches
                </div>
                {popularSearches.map((search) => (
                  <button
                    key={search}
                    type="button"
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            >
              <Filter className="size-4 mr-1" />
              Categories
              {filters.categories?.length ? (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {filters.categories.length}
                </Badge>
              ) : null}
              <ChevronDown className="size-4 ml-1" />
            </Button>
            {showCategoryFilter && (
              <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-background border rounded-md shadow-lg p-4">
                <div className="space-y-2">
                  <div className="font-medium text-sm">Filter by Category</div>
                  {availableFilters.categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={
                          filters.categories?.includes(category) || false
                        }
                        onCheckedChange={(checked) => {
                          const current = filters.categories || [];
                          const updated = checked
                            ? [...current, category]
                            : current.filter((c) => c !== category);
                          handleFilterChange(
                            'categories',
                            updated.length > 0 ? updated : undefined,
                          );
                        }}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className="text-sm capitalize cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDifficultyFilter(!showDifficultyFilter)}
            >
              Difficulty
              {filters.difficulty?.length ? (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {filters.difficulty.length}
                </Badge>
              ) : null}
              <ChevronDown className="size-4 ml-1" />
            </Button>
            {showDifficultyFilter && (
              <div className="absolute top-full left-0 z-50 mt-1 w-48 bg-background border rounded-md shadow-lg p-4">
                <div className="space-y-2">
                  <div className="font-medium text-sm">
                    Filter by Difficulty
                  </div>
                  {availableFilters.difficulties.map((difficulty) => (
                    <div
                      key={difficulty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`difficulty-${difficulty}`}
                        checked={
                          filters.difficulty?.includes(difficulty as any) ||
                          false
                        }
                        onCheckedChange={(checked) => {
                          const current = filters.difficulty || [];
                          const updated = checked
                            ? [...current, difficulty as any]
                            : current.filter((d) => d !== difficulty);
                          handleFilterChange(
                            'difficulty',
                            updated.length > 0 ? updated : undefined,
                          );
                        }}
                      />
                      <label
                        htmlFor={`difficulty-${difficulty}`}
                        className="text-sm capitalize cursor-pointer"
                      >
                        {difficulty}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Featured Filter */}
          <Button
            variant={filters.featured ? 'default' : 'outline'}
            size="sm"
            onClick={() =>
              handleFilterChange(
                'featured',
                filters.featured ? undefined : true,
              )
            }
          >
            Featured Only
          </Button>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="size-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1">
            {filters.categories?.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
                <button
                  type="button"
                  onClick={() => {
                    const updated = filters.categories?.filter(
                      (c) => c !== category,
                    );
                    handleFilterChange(
                      'categories',
                      updated?.length ? updated : undefined,
                    );
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            {filters.difficulty?.map((difficulty) => (
              <Badge key={difficulty} variant="secondary" className="text-xs">
                {difficulty}
                <button
                  type="button"
                  onClick={() => {
                    const updated = filters.difficulty?.filter(
                      (d) => d !== difficulty,
                    );
                    handleFilterChange(
                      'difficulty',
                      updated?.length ? updated : undefined,
                    );
                  }}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            {filters.featured && (
              <Badge variant="secondary" className="text-xs">
                Featured
                <button
                  type="button"
                  onClick={() => handleFilterChange('featured', undefined)}
                  className="ml-1 hover:bg-muted-foreground/20 rounded-full"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
