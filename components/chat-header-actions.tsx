'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HistoryPanel } from '@/components/history-panel';
import { ClockRewind, PlusIcon, MoreHorizontalIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem
} from './ui/dropdown-menu';

export function ChatHeaderActions({ 
  chatId,
  chatTitle,
  isMobile = false
}: { 
  chatId?: string;
  chatTitle?: string;
  isMobile?: boolean;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();

  
  // For larger screens, show all buttons
  return (
    <div className="flex items-center gap-2">
      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <ClockRewind size={16} />
            <span className="ml-2 hidden sm:inline">History</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <HistoryPanel 
            onSelect={(id) => {
              router.push(`${id}`);
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
          const chatPath = '/chat/new';
          router.push(chatPath);
        }}
      >
        <PlusIcon size={16} />
        <span className="ml-2 hidden sm:inline">
          New Chat
        </span>
      </Button>
      
      {/* Show Submit to Knowledge Base button only for capture chats with valid ID and title */}
      {/* {chatType === 'capture' && chatId && chatTitle && (
        <SubmitToKnowledgeBaseButton 
          chatId={chatId} 
          chatTitle={chatTitle} 
        />
      )} */}
    </div>
  );
}
