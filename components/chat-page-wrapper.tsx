'use client';

import { useState } from 'react';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { PageHeader } from '@/components/page-header';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import type { VisibilityType } from '@/components/visibility-selector';
import { ChatHeaderActions } from '@/components/chat-header-actions';
import type { UIMessage } from 'ai';

interface ChatPageWrapperProps {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  title: string;
}

export function ChatPageWrapper({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  title
}: ChatPageWrapperProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();
  const { width } = useWindowSize();
  const isMobile = width < 640;
  
  return (
    <div className="container h-full mx-auto p-2 md:p-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col gap-6 h-full">
        <PageHeader 
          title={title}
          selectedModelId={selectedChatModel}
          showModelSelector={!isReadonly}
          isReadonly={isReadonly}
        >
          <ChatHeaderActions 
            chatId={id}
            chatTitle={title}
            isMobile={isMobile}
          />
        </PageHeader>
        
        <Chat
          id={id}
          initialMessages={initialMessages}
          selectedChatModel={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
          title={title}
        />
        <DataStreamHandler id={id} />
      </div>
    </div>
  );
}
