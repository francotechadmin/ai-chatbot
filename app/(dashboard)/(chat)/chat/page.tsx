import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { getChatHistory } from './actions';
import { ChatInterface } from './components/chat-interface';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NewChatButton } from './components/new-chat-button';
import { ModelSelector } from './components/model-selector';
import { LoadingChat } from './components/loading-chat';
import type { Chat } from '@/lib/db/schema';
import { ClockRewind } from '@/components/icons';
import { HistoryPanel } from './components/history-panel';

export default async function ChatPage() {
  redirect('/chat/new');
  // Generate a unique chat ID on the server
  const chatId = generateUUID();
  
  // Get the selected model from cookies or use default
  const selectedModel = DEFAULT_CHAT_MODEL;
  
  // Get the user session
  const session = await auth();
  
  // Fetch chat history on the server
  let chatHistory: Chat[] = [];
  if (session?.user?.id) {
    try {
      // Fetch chats
      const chats = await getChatHistory();
      chatHistory = chats.sort((a, b) => {
        // Sort by createdAt to avoid issues with updatedAt column
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
      // Continue with empty history on error
    }
  }
  
  return (
    <div className="container mx-auto p-2 md:p-6 max-w-[100vw] h-full overflow-hidden">
      <div className="flex flex-col gap-6 h-full">
        <PageHeader 
          title="Chat"
          selectedModelId={selectedModel}
          showModelSelector={false}
        >
          <div className="flex items-center gap-2">
            <div className="shrink-0 w-[140px] md:w-auto">
              <Suspense fallback={<Button variant="outline" className="w-full h-[34px] text-sm" disabled>Loading...</Button>}>
                 <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full h-[34px] text-sm">
                      <ClockRewind size={16} />
                      <span className="ml-2">History</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
                    <HistoryPanel />
                  </SheetContent>
                </Sheet>
              </Suspense>
            </div>
            <div className="shrink-0 w-[140px] md:w-auto">
              <NewChatButton />
            </div>
            <div className="shrink-0 w-[140px] md:w-auto">
              <ModelSelector
                selectedModelId={selectedModel}
                className="mr-2 w-full"
              />
            </div>
          </div>
        </PageHeader>
        
        <ChatInterface
          key={chatId}
          id={chatId}
          initialMessages={[]}
          selectedChatModel={selectedModel}
          selectedVisibilityType="private"
          isReadonly={false}
        />
        <DataStreamHandler id={chatId} />
      </div>
    </div>
  );
}