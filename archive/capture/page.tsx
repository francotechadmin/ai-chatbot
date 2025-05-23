'use client';

import { useState } from 'react';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HistoryPanel } from '@/components/history-panel';
import { ClockRewind, PlusIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';

export default function CapturePage() {
  const [chatId] = useState(() => generateUUID());
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();
  
  return (
    <div className="container mx-auto p-2 md:p-6 max-w-[100vw] h-full overflow-hidden">
      <div className="flex flex-col gap-6 h-full">
        <PageHeader 
          title="Capture"
          selectedModelId={DEFAULT_CHAT_MODEL}
          showModelSelector={true}
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
                    defaultType="capture" 
                    onSelect={(id) => {
                      router.push(`/capture/${id}`);
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
                  router.push('/capture/new');
                }}
                className="w-full h-[34px] text-sm"
              >
                <PlusIcon size={16} />
                <span className="ml-2">New Capture</span>
              </Button>
            </div>
          </div>
        </PageHeader>
        
        <Chat
          key={chatId}
          id={chatId}
          initialMessages={[]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
          chatType="capture"
        />
        <DataStreamHandler id={chatId} />
      </div>
    </div>
  );
}
