'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FileIcon, MessageIcon, GlobeIcon } from '@/components/icons';

export interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
}

interface HelpContentProps {
  articles: HelpArticle[];
  searchQuery: string;
}

export function HelpContent({ articles, searchQuery }: HelpContentProps) {
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    article.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <FileIcon size={20} />
            </div>
            <CardTitle className="mb-1">Basics</CardTitle>
            <CardDescription>Getting started guides</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="size-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <FileIcon size={20} />
            </div>
            <CardTitle className="mb-1">Guides</CardTitle>
            <CardDescription>Step-by-step tutorials</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="size-12 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <GlobeIcon size={20} />
            </div>
            <CardTitle className="mb-1">API</CardTitle>
            <CardDescription>Integration documentation</CardDescription>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <MessageIcon size={20} />
            </div>
            <CardTitle className="mb-1">Support</CardTitle>
            <CardDescription>Troubleshooting help</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Popular Articles */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation</CardTitle>
          <CardDescription>
            {searchQuery ? `Search results for "${searchQuery}"` : 'Popular articles and guides'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <div key={article.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium mb-1">{article.title}</h3>
                      <p className="text-sm text-muted-foreground">{article.summary}</p>
                    </div>
                    <span className="text-xs bg-muted py-1 px-2 rounded-full whitespace-nowrap shrink-0">
                      {article.readTime}
                    </span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-muted-foreground capitalize">
                      {article.category}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <span className="mx-auto mb-4 text-muted-foreground">
                  <FileIcon size={32} />
                </span>
                <h3 className="text-lg font-medium mb-1">No articles found</h3>
                <p className="text-muted-foreground">
                  We couldn&apos;t find any articles matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}