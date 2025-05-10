import { Suspense } from 'react';
// import { cookies } from 'next/headers';
import { auth } from '@/app/(auth)/auth';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { getChatHistory } from './actions';
import { ChatInterface } from './components/chat-interface';
import { Button } from '@/components/ui/button';
import { ModelSelector } from './components/model-selector';
import { HistorySidebarWrapper } from './components/history-sidebar-wrapper';
import { NewQueryButton } from './components/new-query-button';
import { LoadingChat } from './components/loading-chat';
import type { Chat } from '@/lib/db/schema';

export default async function QueryPage() {
  // Generate a unique chat ID on the server
  const chatId = generateUUID();
  
  // Get the selected model from cookies or use default
  // const cookieStore = await cookies();
  // const selectedModel = cookieStore.get('chat-model')?.value || DEFAULT_CHAT_MODEL;
  const selectedModel = DEFAULT_CHAT_MODEL; // For simplicity, using default model directly
  
  // Get the user session
  const session = await auth();
  
  // Fetch chat history on the server
  let chatHistory: Chat[] = [];
  if (session?.user?.id) {
    try {
      chatHistory = await getChatHistory('query');
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      // Continue with empty history on error
    }
  }
  
  return (
    <div className="container mx-auto p-2 md:p-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col gap-6">
        <PageHeader 
          selectedModelId={selectedModel}
          showModelSelector={false}
        >
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-[140px] md:w-auto">
              <Suspense fallback={<Button variant="outline" className="w-full h-[34px] text-sm" disabled>Loading...</Button>}>
                <HistorySidebarWrapper chats={chatHistory} />
              </Suspense>
            </div>
            <div className="shrink-0 w-[140px] md:w-auto">
              <NewQueryButton />
            </div>
            <div className="shrink-0 w-[140px] md:w-auto">
              <ModelSelector
                selectedModelId={selectedModel}
                className="mr-2 w-full"
              />
            </div>
          </div>
        </PageHeader>
        
        <Suspense fallback={<LoadingChat />}>
          <ChatInterface
            key={chatId}
            id={chatId}
            initialMessages={[]}
            selectedChatModel={selectedModel}
            selectedVisibilityType="private"
            isReadonly={false}
          />
        </Suspense>
        <DataStreamHandler id={chatId} />
      </div>
    </div>
  );
}

