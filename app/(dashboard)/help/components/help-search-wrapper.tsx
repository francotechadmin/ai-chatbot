'use client';

import { HelpSearch } from './help-search';

interface HelpSearchWrapperProps {
  initialQuery?: string;
}

export function HelpSearchWrapper({ initialQuery = '' }: HelpSearchWrapperProps) {
  const handleSearch = (query: string) => {
    // Handle the search client-side
    // For example, update the URL with the search query
    const url = new URL(window.location.href);
    url.searchParams.set('query', query);
    window.history.pushState({}, '', url.toString());
  };

  return (
    <HelpSearch 
      onSearch={handleSearch}
      initialQuery={initialQuery}
    />
  );
}