'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FileText,
  BookOpen,
  Settings,
  Users,
  Globe,
  Code,
  MessageCircle,
  Filter,
  X,
} from 'lucide-react';
import { categories } from '@/content/help';
import type { Article } from '@/content/help';

interface CategoryFilterProps {
  articles: Article[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  showCounts?: boolean;
}

const categoryIcons = {
  basics: FileText,
  guides: BookOpen,
  advanced: Settings,
  administration: Users,
  integrations: Globe,
  api: Code,
  support: MessageCircle,
};

const categoryColors = {
  basics: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  guides: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
  advanced:
    'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200',
  administration:
    'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  integrations:
    'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
  api: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
  support: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200',
};

export function CategoryFilter({
  articles,
  selectedCategories,
  onCategoryChange,
  showCounts = true,
}: CategoryFilterProps) {
  const [showAll, setShowAll] = useState(false);

  // Count articles per category
  const categoryCounts = categories.reduce(
    (acc, category) => {
      acc[category.id] = articles.filter(
        (article) => article.frontmatter.category === category.id,
      ).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleCategoryClick = (categoryId: string) => {
    const isSelected = selectedCategories.includes(categoryId);
    if (isSelected) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const clearAllCategories = () => {
    onCategoryChange([]);
  };

  const visibleCategories = showAll ? categories : categories.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visibleCategories.map((category) => {
          const Icon =
            categoryIcons[category.id as keyof typeof categoryIcons] ||
            FileText;
          const isSelected = selectedCategories.includes(category.id);
          const count = categoryCounts[category.id] || 0;
          const colorClass =
            categoryColors[category.id as keyof typeof categoryColors];

          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'hover:border-primary/50 hover:shadow-sm'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div
                  className={`size-12 rounded-full mx-auto mb-3 flex items-center justify-center ${colorClass}`}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="font-medium text-sm mb-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {category.description}
                </p>
                {showCounts && (
                  <Badge variant="secondary" className="text-xs">
                    {count} article{count !== 1 ? 's' : ''}
                  </Badge>
                )}
                {isSelected && (
                  <div className="mt-2">
                    <Badge variant="default" className="text-xs">
                      <Filter className="size-3 mr-1" />
                      Selected
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {categories.length > 4 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${categories.length} Categories`}
          </Button>
        </div>
      )}

      {/* Selected Categories Summary */}
      {selectedCategories.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Active Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllCategories}
                className="text-xs"
              >
                <X className="size-3 mr-1" />
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId);
                if (!category) return null;

                return (
                  <Badge
                    key={categoryId}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-muted"
                    onClick={() => handleCategoryClick(categoryId)}
                  >
                    {category.name}
                    <X className="size-3 ml-1" />
                  </Badge>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Showing articles from {selectedCategories.length} categor
              {selectedCategories.length !== 1 ? 'ies' : 'y'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links to Popular Categories */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-sm mb-3">Quick Access</h4>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/help?categories=basics">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                <FileText className="size-3 mr-2" />
                Getting Started
              </Button>
            </Link>
            <Link href="/help?categories=support">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                <MessageCircle className="size-3 mr-2" />
                Troubleshooting
              </Button>
            </Link>
            <Link href="/help?categories=api">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                <Code className="size-3 mr-2" />
                API Docs
              </Button>
            </Link>
            <Link href="/help?categories=integrations">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs"
              >
                <Globe className="size-3 mr-2" />
                Integrations
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
