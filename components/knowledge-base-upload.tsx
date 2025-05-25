'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface KnowledgeBaseUploadProps {
  result: any;
  isReadonly?: boolean;
}

export function KnowledgeBaseUpload({ result, isReadonly }: KnowledgeBaseUploadProps) {
  // If the result is a string (success message), display it
  if (typeof result === 'string') {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
        <CheckCircle2 className="size-5" />
        <span>{result}</span>
      </div>
    );
  }

  // If the result has a title and sourceId
  if (result?.title && result.sourceId) {
    return (
      <div className="flex flex-col gap-2 border rounded-md p-4 bg-muted/30">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
          <CheckCircle2 className="size-5" />
          <span>Document added to knowledge base</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">Title:</span> {result.title}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">ID:</span> {result.sourceId}
        </div>
      </div>
    );
  }

  // Fallback for unexpected result format
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
        <CheckCircle2 className="size-5" />
        <span>Document successfully added to knowledge base</span>
      </div>
      
      {/* Knowledge Base Guide */}
      <div className="bg-muted/50 border rounded-md p-4 my-2">
        <div className="flex items-center gap-2 mb-2">
          <Info className="size-5 text-blue-500" />
          <h3 className="font-medium">Knowledge Base Tool Guide</h3>
        </div>
        
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            When uploading a document created with the <code>createDocument</code> tool to the knowledge base, use the <code>documentId</code> parameter:
          </p>
          
          <div className="bg-muted p-2 rounded-md font-mono text-xs mt-2">
            {`uploadToKnowledgeBase({
  title: "Document Title",
  content: "...", // Can be the same as returned by createDocument
  documentId: "abc123", // The ID from createDocument response
  sourceType: "document"
})`}
          </div>
          
          <p className="mt-2 flex items-center gap-1">
            <AlertCircle className="size-4 text-amber-500" />
            <span>The document ID is required to properly retrieve the document content.</span>
          </p>
        </div>
      </div>
    </div>
  );
}