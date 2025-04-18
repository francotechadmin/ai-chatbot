'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HistoryPanel } from '@/components/history-panel';
import { ClockRewind, PlusIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';

export function ChatHeaderActions({ 
  chatType 
}: { 
  chatType: 'query' | 'capture' 
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
            defaultType={chatType} 
            onSelect={(id) => {
              router.push(`/${chatType}/chat/${id}`);
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
          router.push(`/${chatType}/chat/new`);
        }}
      >
        <PlusIcon size={16} />
        <span className="ml-2">New {chatType === 'query' ? 'Query' : 'Capture'}</span>
      </Button>
    </div>
  );
}
