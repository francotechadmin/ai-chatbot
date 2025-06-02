'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateTableOfContents } from '@/lib/content-utils';

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const toc = useMemo(() => generateTableOfContents(content), [content]);

  if (toc.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Table of Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-1">
          {toc.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              className={`
                block w-full text-left text-sm hover:text-primary transition-colors
                ${item.level === 1 ? 'font-medium' : ''}
                ${item.level === 2 ? 'pl-3' : ''}
                ${item.level === 3 ? 'pl-6' : ''}
                ${item.level === 4 ? 'pl-9' : ''}
                ${item.level === 5 ? 'pl-12' : ''}
                ${item.level === 6 ? 'pl-15' : ''}
              `}
            >
              {item.title}
            </button>
          ))}
        </nav>
      </CardContent>
    </Card>
  );
}
