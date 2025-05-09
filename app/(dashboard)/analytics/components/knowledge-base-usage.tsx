'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { KnowledgeCategory } from '../types';

interface KnowledgeBaseUsageProps {
  data?: KnowledgeCategory[];
}

export function KnowledgeBaseUsage({ data }: KnowledgeBaseUsageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Knowledge Base Usage</CardTitle>
        <CardDescription>Most accessed knowledge categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((category, index) => (
              <div key={`kb-${category.category}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.category}</span>
                  <span className="text-sm text-muted-foreground">{category.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${category.percentage}%` }} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No knowledge base usage data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}