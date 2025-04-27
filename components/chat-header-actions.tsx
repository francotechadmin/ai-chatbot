'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HistoryPanel } from '@/components/history-panel';
import { ClockRewind, PlusIcon, MoreHorizontalIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { SubmitToKnowledgeBaseButton } from './submit-to-kb-button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem
} from './ui/dropdown-menu';

export function ChatHeaderActions({ 
  chatType,
  chatId,
  chatTitle,
  isMobile = false
}: { 
  chatType: 'general' | 'query' | 'capture';
  chatId?: string;
  chatTitle?: string;
  isMobile?: boolean;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();
  
  // For very small screens, use a dropdown menu
  if (isMobile) {
    return (
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontalIcon size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setHistoryOpen(true);
                }}
              >
                <div className="flex items-center">
                  <ClockRewind size={16} />
                  <span className="ml-2">History</span>
                </div>
                <div className="flex items-center">
                  <PlusIcon size={16} />
                  <span className="ml-2">
                    New {
                      chatType === 'query' ? 'Query' : 
                      chatType === 'capture' ? 'Capture' : 
                      'Chat'
                    }
                  </span>
                </div>
              </DropdownMenuItem>
              {chatType === 'capture' && chatId && chatTitle && (
                <DropdownMenuItem asChild>
                  <SubmitToKnowledgeBaseButton 
                    chatId={chatId} 
                    chatTitle={chatTitle}
                  />
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* History panel is outside the dropdown but triggered by it */}
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
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
      </div>
    );
  }
  
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
        <span className="ml-2 hidden sm:inline">
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
