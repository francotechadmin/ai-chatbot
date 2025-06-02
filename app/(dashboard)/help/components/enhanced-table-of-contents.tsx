'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateTableOfContents } from '@/lib/content-utils';
import {
  List,
  ChevronRight,
  Clock,
  Hash,
  Eye,
  EyeOff,
  ArrowUp,
  Minus,
  Plus,
} from 'lucide-react';

interface TableOfContentsProps {
  content: string;
  showReadingTime?: boolean;
  showProgress?: boolean;
  collapsible?: boolean;
}

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TOCSection {
  title: string;
  items: TOCItem[];
  level: number;
}

export function EnhancedTableOfContents({
  content,
  showReadingTime = true,
  showProgress = false,
  collapsible = true,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [estimatedReadTime, setEstimatedReadTime] = useState(0);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const toc = useMemo(() => generateTableOfContents(content), [content]);

  // Group TOC items into sections
  const sections = useMemo(() => {
    const grouped: TOCSection[] = [];
    let currentSection: TOCSection | null = null;

    toc.forEach((item) => {
      if (item.level === 1 || item.level === 2) {
        // Start a new section for h1 and h2
        if (currentSection) {
          grouped.push(currentSection);
        }
        currentSection = {
          title: item.title,
          items: [item],
          level: item.level,
        };
      } else if (currentSection) {
        // Add to current section
        currentSection.items.push(item);
      } else {
        // No section yet, create one
        currentSection = {
          title: item.title,
          items: [item],
          level: item.level,
        };
      }
    });

    if (currentSection) {
      grouped.push(currentSection);
    }

    return grouped;
  }, [toc]);

  // Initialize collapsed sections (all collapsed by default)
  useEffect(() => {
    const initialCollapsed = new Set(
      sections.map((_, index) => index.toString()),
    );
    setCollapsedSections(initialCollapsed);
  }, [sections]);

  // Calculate estimated reading time
  useEffect(() => {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    setEstimatedReadTime(minutes);
  }, [content]);

  // Track scroll position and active heading
  useEffect(() => {
    const handleScroll = () => {
      const headings = toc
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);

      if (headings.length === 0) return;

      // Calculate reading progress
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min((scrollTop / docHeight) * 100, 100);
      setReadingProgress(progress);

      // Find active heading
      let activeHeading = '';
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading && heading.offsetTop <= scrollTop + 100) {
          activeHeading = heading.id;
          break;
        }
      }
      setActiveId(activeHeading);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Use scrollIntoView for more reliable scrolling
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });

      // Add a small delay to account for smooth scrolling, then adjust for header
      setTimeout(() => {
        const headerOffset = 100;
        const currentScrollY = window.scrollY;
        window.scrollTo({
          top: currentScrollY - headerOffset,
          behavior: 'smooth',
        });
      }, 100);

      // Update active state immediately for better UX
      setActiveId(id);
    }
  };

  const toggleSection = (sectionIndex: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionIndex)) {
      newCollapsed.delete(sectionIndex);
    } else {
      newCollapsed.add(sectionIndex);
    }
    setCollapsedSections(newCollapsed);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Hash className="size-3" />;
      case 2:
        return <Hash className="size-3 opacity-80" />;
      case 3:
        return <Hash className="size-3 opacity-60" />;
      default:
        return <Hash className="size-3 opacity-40" />;
    }
  };

  const getItemsByLevel = () => {
    const grouped: { [key: number]: TOCItem[] } = {};
    toc.forEach((item) => {
      if (!grouped[item.level]) grouped[item.level] = [];
      grouped[item.level].push(item);
    });
    return grouped;
  };

  const groupedItems = getItemsByLevel();

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <List className="size-5" />
            Contents
          </CardTitle>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="size-6 p-0"
            >
              {isCollapsed ? (
                <Eye className="size-4" />
              ) : (
                <EyeOff className="size-4" />
              )}
            </Button>
          )}
        </div>

        {/* Reading Stats */}
        {showReadingTime && !isCollapsed && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="size-3" />
              {estimatedReadTime} min read
            </div>
            <div className="flex items-center gap-1">
              <List className="size-3" />
              {toc.length} sections
            </div>
          </div>
        )}

        {/* Reading Progress */}
        {showProgress && !isCollapsed && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Reading Progress</span>
              <span>{Math.round(readingProgress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${readingProgress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          <nav className="space-y-2">
            {sections.map((section, sectionIndex) => {
              const sectionKey = sectionIndex.toString();
              const isCollapsed = collapsedSections.has(sectionKey);
              const hasActiveItem = section.items.some(
                (item) => item.id === activeId,
              );

              return (
                <div key={sectionKey} className="space-y-1">
                  {/* Section Header */}
                  <button
                    type="button"
                    onClick={() => toggleSection(sectionKey)}
                    className={`
                      group flex items-center gap-2 w-full text-left text-sm transition-all duration-200 p-2 rounded-md
                      ${
                        hasActiveItem
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'hover:bg-muted/50 text-foreground'
                      }
                      ${section.level === 1 ? 'font-semibold' : 'font-medium'}
                    `}
                  >
                    <div className="shrink-0 ">
                      {isCollapsed ? (
                        <Plus className="size-3" />
                      ) : (
                        <Minus className="size-3" />
                      )}
                    </div>
                    <div className="shrink-0 ">
                      {getLevelIcon(section.level)}
                    </div>
                    <span className="flex-1 line-clamp-1 break-words">
                      {section.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {section.items.length}
                    </Badge>
                  </button>

                  {/* Section Items */}
                  {!isCollapsed && (
                    <div className="ml-4 space-y-1">
                      {section.items.map((item) => {
                        const isActive = activeId === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleClick(item.id)}
                            className={`
                              group flex items-start gap-2 w-full text-left text-sm transition-all duration-200 py-1.5 px-2 rounded-md
                              ${
                                isActive
                                  ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                                  : 'hover:bg-muted/50 hover:text-primary text-muted-foreground'
                              }
                              ${item.level === 1 ? 'font-medium' : ''}
                              ${item.level === 2 ? '' : ''}
                              ${item.level === 3 ? 'ml-3' : ''}
                              ${item.level === 4 ? 'ml-6' : ''}
                              ${item.level === 5 ? 'ml-9' : ''}
                              ${item.level === 6 ? 'ml-12' : ''}
                            `}
                          >
                            <div className="shrink-0  mt-0.5">
                              {getLevelIcon(item.level)}
                            </div>
                            <span className="flex-1 line-clamp-2 break-words">
                              {item.title}
                            </span>
                            {isActive && (
                              <ChevronRight className="size-3 shrink-0  mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsedSections(new Set())}
              className="flex-1 justify-start text-xs"
            >
              <Eye className="size-3 mr-2" />
              Expand All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCollapsedSections(
                  new Set(sections.map((_, i) => i.toString())),
                )
              }
              className="flex-1 justify-start text-xs"
            >
              <EyeOff className="size-3 mr-2" />
              Collapse All
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTop}
              className="w-full justify-start text-xs"
            >
              <ArrowUp className="size-3 mr-2" />
              Back to Top
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
