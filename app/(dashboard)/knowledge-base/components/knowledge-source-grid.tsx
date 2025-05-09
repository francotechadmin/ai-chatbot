'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Clock, CheckCircle, XCircle, FileText, FileImage, Video, Globe, Database, MessageSquare } from 'lucide-react';
import { formatDistance } from 'date-fns';
import type { KnowledgeSource } from '@/lib/db/schema';

interface KnowledgeSourceGridProps {
  sources: KnowledgeSource[];
}

export function KnowledgeSourceGrid({ sources }: KnowledgeSourceGridProps) {
  const router = useRouter();
  
  if (sources.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No knowledge sources found</h3>
        <p className="text-muted-foreground mt-2">
          Start by capturing knowledge or uploading documents.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sources.map((source) => (
        <Card 
          key={source.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/knowledge-base/${source.id}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{source.title}</CardTitle>
              {source.status === 'pending' && <Clock size={18} className="text-yellow-500" />}
              {source.status === 'approved' && <CheckCircle size={18} className="text-green-500" />}
              {source.status === 'rejected' && <XCircle size={18} className="text-red-500" />}
            </div>
            <CardDescription className="flex items-center gap-1">
              {source.sourceType === 'document' && <FileText size={14} className="text-blue-500" />}
              {source.sourceType === 'image' && <FileImage size={14} className="text-green-500" />}
              {source.sourceType === 'video' && <Video size={14} className="text-red-500" />}
              {source.sourceType === 'webpage' && <Globe size={14} className="text-purple-500" />}
              {source.sourceType === 'api' && <Database size={14} className="text-orange-500" />}
              {source.sourceType === 'chat' && <MessageSquare size={14} className="text-teal-500" />}
              <span>{source.sourceType.charAt(0).toUpperCase() + source.sourceType.slice(1)}</span>
              {source.status === 'pending' && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">Pending</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm line-clamp-2">
              {source.description || 'No description provided'}
            </p>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Added {formatDistance(new Date(source.createdAt), new Date(), { addSuffix: true })}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}