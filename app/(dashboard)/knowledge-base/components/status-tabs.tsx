'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { KnowledgeSource } from '@/lib/db/schema';
import { KnowledgeSourceGrid } from './knowledge-source-grid';

interface StatusTabsProps {
  sources: KnowledgeSource[];
  filteredSources: KnowledgeSource[];
}

export function StatusTabs({ sources, filteredSources }: StatusTabsProps) {
  const [activeTab, setActiveTab] = useState('all');
  
  // Get counts for each status
  const pendingCount = sources.filter(source => source.status === 'pending').length;
  const approvedCount = sources.filter(source => source.status === 'approved').length;
  const rejectedCount = sources.filter(source => source.status === 'rejected').length;
  
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="all">
          All ({sources.length})
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending ({pendingCount})
        </TabsTrigger>
        <TabsTrigger value="approved">
          Approved ({approvedCount})
        </TabsTrigger>
        <TabsTrigger value="rejected">
          Rejected ({rejectedCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-0">
        <KnowledgeSourceGrid 
          sources={filteredSources} 
        />
      </TabsContent>
      
      <TabsContent value="pending" className="mt-0">
        <KnowledgeSourceGrid 
          sources={filteredSources.filter(source => source.status === 'pending')} 
        />
      </TabsContent>
      
      <TabsContent value="approved" className="mt-0">
        <KnowledgeSourceGrid 
          sources={filteredSources.filter(source => source.status === 'approved')} 
        />
      </TabsContent>
      
      <TabsContent value="rejected" className="mt-0">
        <KnowledgeSourceGrid 
          sources={filteredSources.filter(source => source.status === 'rejected')} 
        />
      </TabsContent>
    </Tabs>
  );
}