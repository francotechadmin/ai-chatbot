'use client';

import { Markdown } from './markdown';

// Define types for our UI results
interface KnowledgeBaseItem {
  title: string;
  sourceLink: string;
  matchCount: number;
}

interface KnowledgeBaseContentItem {
  title: string;
  content: string;
}

interface KnowledgeBaseResponse {
  uiResults: KnowledgeBaseItem[];
  contentResults: KnowledgeBaseContentItem[];
  _display: string;
  summary: string;
}

interface KnowledgeBaseResultProps {
  result: string | KnowledgeBaseItem[] | KnowledgeBaseResponse | any;
  isReadonly?: boolean;
}

export function KnowledgeBaseResult({ result, isReadonly }: KnowledgeBaseResultProps) {
  // If the result is a string (error message), display it
  if (typeof result === 'string') {
    return <div className="text-muted-foreground">{result}</div>;
  }

  // Handle the new response format with uiResults property
  if (result && result.uiResults) {
    const uiResults = result.uiResults;
    
    if (uiResults.length === 0) {
      return <div className="text-muted-foreground">No relevant information found in the knowledge base.</div>;
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="text-sm text-muted-foreground mb-2">
          Found {uiResults.length} relevant {uiResults.length === 1 ? 'document' : 'documents'} in the knowledge base:
        </div>
        
        <div className="flex flex-col gap-2">
          {uiResults.map((item: KnowledgeBaseItem, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <a
                href={item.sourceLink}
                className="text-primary hover:underline flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" x2="8" y1="13" y2="13"/>
                  <line x1="16" x2="8" y1="17" y2="17"/>
                  <line x1="10" x2="8" y1="9" y2="9"/>
                </svg>
                {item.title}
              </a>
              {item.matchCount > 1 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {item.matchCount} matches
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Handle legacy array format for backward compatibility
  if (Array.isArray(result)) {
    if (result.length === 0) {
      return <div className="text-muted-foreground">No relevant information found in the knowledge base.</div>;
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="text-sm text-muted-foreground mb-2">
          Found {result.length} relevant {result.length === 1 ? 'document' : 'documents'} in the knowledge base:
        </div>
        
        <div className="flex flex-col gap-2">
          {result.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <a
                href={item.sourceLink}
                className="text-primary hover:underline flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" x2="8" y1="13" y2="13"/>
                  <line x1="16" x2="8" y1="17" y2="17"/>
                  <line x1="10" x2="8" y1="9" y2="9"/>
                </svg>
                {item.title}
              </a>
              {item.matchCount > 1 && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {item.matchCount} matches
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fallback for unexpected result format
  return <div className="text-muted-foreground">Knowledge base query completed.</div>;
}