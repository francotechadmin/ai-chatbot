'use client';

import { useState } from 'react';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { PageHeader } from '@/components/page-header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HistoryPanel } from '@/components/history-panel';
import { ClockRewind, PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { UIMessage } from 'ai';
import type { VisibilityType } from '@/components/visibility-selector';

interface ChatPageWrapperProps {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  chatType: 'query' | 'capture';
  title: string;
}

export function ChatPageWrapper({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  chatType,
  title
}: ChatPageWrapperProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();
  
  return (
    <div className="container mx-auto p-2 md:p-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col gap-6">
        <PageHeader 
          title={title}
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          showModelSelector={!isReadonly}
          showVisibilitySelector={!isReadonly}
          isReadonly={isReadonly}
        >
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-[140px] md:w-auto">
              <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full h-[34px] text-sm">
                    <ClockRewind size={16} />
                    <span className="ml-2">History</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
                  <HistoryPanel 
                    defaultType={chatType} 
                    onSelect={(chatId) => {
                      router.push(`/${chatType}/chat/${chatId}`);
                      setHistoryOpen(false);
                    }}
                    onClose={() => setHistoryOpen(false)}
                  />
                </SheetContent>
              </Sheet>
            </div>
            <div className="shrink-0 w-[140px] md:w-auto">
              <Button 
                variant="outline" 
                onClick={() => {
                  router.push(`/${chatType}/chat/new`);
                }}
                className="w-full h-[34px] text-sm"
              >
                <PlusIcon size={16} />
                <span className="ml-2">New {chatType === 'query' ? 'Query' : 'Capture'}</span>
              </Button>
            </div>
          </div>
        </PageHeader>
        
        <Chat
          id={id}
          initialMessages={initialMessages}
          selectedChatModel={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
          chatType={chatType}
        />
        <DataStreamHandler id={id} />
      </div>
    </div>
  );
}
