'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SearchFilterProps {
  initialQuery: string;
}

export function SearchFilter({ initialQuery }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Update URL with search query
    const params = new URLSearchParams(window.location.search);
    if (query) {
      params.set('search', query);
    } else {
      params.delete('search');
    }
    
    router.replace(`${pathname}?${params.toString()}`);
  };
  
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="Search knowledge base..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      <Button variant="outline" size="icon">
        <Filter size={18} />
      </Button>
    </div>
  );
}