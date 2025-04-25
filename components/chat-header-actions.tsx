'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HistoryPanel } from '@/components/history-panel';
import { ClockRewind, PlusIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { SubmitToKnowledgeBaseButton } from './submit-to-kb-button';

export function ChatHeaderActions({ 
  chatType,
  chatId,
  chatTitle
}: { 
  chatType: 'general' | 'query' | 'capture';
  chatId?: string;
  chatTitle?: string;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();
  
  return (
    <div className="flex items-center gap-2">
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <ClockRewind size={16} />
            <span className="ml-2">History</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <HistoryPanel 
            defaultType={chatType === 'general' ? 'all' : chatType} 
            onSelect={(id) => {
              const chatPath = chatType === 'general' ? '/chat/' : `/${chatType}/chat/`;
              router.push(`${chatPath}${id}`);
              setHistoryOpen(false);
            }}
            onClose={() => setHistoryOpen(false)}
          />
        </SheetContent>
      </Sheet>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          const chatPath = chatType === 'general' ? '/chat/new' : `/${chatType}/chat/new`;
          router.push(chatPath);
        }}
      >
        <PlusIcon size={16} />
        <span className="ml-2">
          New {
            chatType === 'query' ? 'Query' : 
            chatType === 'capture' ? 'Capture' : 
            'Chat'
          }
        </span>
      </Button>
      
      {/* Show Submit to Knowledge Base button only for capture chats with valid ID and title */}
      {chatType === 'capture' && chatId && chatTitle && (
        <SubmitToKnowledgeBaseButton 
          chatId={chatId} 
          chatTitle={chatTitle} 
        />
      )}
    </div>
  );
}
