'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { TopSearch } from '../types';

interface TopSearchesProps {
  data?: TopSearch[];
}

export function TopSearches({ data }: TopSearchesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Searches</CardTitle>
        <CardDescription>Most frequent queries</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data && data.length > 0 ? (
            data.map((search, index) => (
              <div key={`query-${search.query}-${search.rank}`} className="flex items-center gap-2 pb-2 border-b">
                <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium">{search.rank}</div>
                <div className="flex-1">{search.query}</div>
                <div className="text-sm text-muted-foreground">{search.count}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No search data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}