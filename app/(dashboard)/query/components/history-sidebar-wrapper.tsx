'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ClockRewind } from '@/components/icons';
import { HistorySidebar } from './history-sidebar';
import type { Chat } from '@/lib/db/schema';

interface HistorySidebarWrapperProps {
  chats: Chat[];
}

export function HistorySidebarWrapper({ chats }: HistorySidebarWrapperProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full h-[34px] text-sm">
          <ClockRewind size={16} />
          <span className="ml-2">History</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <HistorySidebar chats={chats} />
      </SheetContent>
    </Sheet>
  );
}