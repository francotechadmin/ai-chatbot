import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import type { UIMessage } from 'ai';

export default async function NewCapturePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  // Create a system message for knowledge capture
  const systemMessage: UIMessage = {
    id: generateUUID(),
    role: 'system',
    content: '',
    parts: [
      {
        type: 'text',
        text: 'You are a knowledge capture assistant. Help the user document, organize, and structure their knowledge and information.'
      }
    ]
  };

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[systemMessage]}
          selectedChatModel={DEFAULT_CHAT_MODEL}
          selectedVisibilityType="private"
          isReadonly={false}
          chatType="capture"
        />
        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[systemMessage]}
        selectedChatModel={modelIdFromCookie.value}
        selectedVisibilityType="private"
        isReadonly={false}
        chatType="capture"
      />
      <DataStreamHandler id={id} />
    </>
  );
}
