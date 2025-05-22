'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useSWRConfig } from 'swr';
import type { Attachment, UIMessage } from 'ai';
import type { Vote } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { MultimodalInput } from '@/components/multimodal-input';
import { Messages } from '@/components/messages';
import { Artifact } from '@/components/artifact';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  selectedVisibilityType: 'private' | 'public';
  isReadonly: boolean;
  votes?: Array<Vote>;
}

export function ChatInterface({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  votes = [],
}: ChatInterfaceProps) {
  const { mutate } = useSWRConfig();
  const apiEndpoint = '/api/query/chat';

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel, chatType: 'query' },
    api: apiEndpoint,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      // Revalidate chat history after a new message
      mutate('/api/history');
    },
    onError: (error) => {
      console.error('Chat error:', error);
      toast.error('An error occurred, please try again!');
    },
  });

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 flex-1 justify-between overflow-hidden">
        <div></div>
        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages as any}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          chatType="query"
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages as any}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages as any}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}