import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { ChatPageWrapper } from '@/components/chat-page-wrapper';

export default async function NewUnifiedChatPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
  const selectedChatModel = modelIdFromCookie ? modelIdFromCookie.value : DEFAULT_CHAT_MODEL;
  console.log('Selected chat model from cookie:', selectedChatModel);
  return (
    <ChatPageWrapper
      id={id}
      initialMessages={[]}
      selectedChatModel={selectedChatModel}
      selectedVisibilityType="private"
      isReadonly={false}
      title="New Chat"
    />
  );
}