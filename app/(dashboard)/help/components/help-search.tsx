'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface HelpSearchProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function HelpSearch({ onSearch, initialQuery = '' }: HelpSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="max-w-xl mx-auto">
          <h2 className="text-center text-xl font-bold mb-2">How can we help you today?</h2>
          <p className="text-center text-muted-foreground mb-4">
            Search our knowledge base or browse the categories below
          </p>
          <div className="relative">
            <Input
              placeholder="Search documentation..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}