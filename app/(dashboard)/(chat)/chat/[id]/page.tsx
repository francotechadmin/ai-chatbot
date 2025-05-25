import { cookies } from 'next/headers';
import { redirect, } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { ChatPageWrapper } from '@/components/chat-page-wrapper';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';


export default async function UnifiedChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  console.log('UnifiedChatPage', id);

  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }


  try {
    const chat = await getChatById({ id });
    console.log('chat', chat);
    
    if (!chat) {
      redirect('/chat');
    }
    
    console.log('getting messages for chat', id);
    const messages = await getMessagesByChatId({
      id,
    });

    console.log('messages', messages);
    if (!messages || messages.length === 0) {
      console.error('No messages found for chat:', id);
    }

    function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
      return messages.map((message) => ({
        id: message.id,
        parts: message.parts as UIMessage['parts'],
        role: message.role as UIMessage['role'],
        content: '',
        createdAt: message.createdAt,
        experimental_attachments:
          (message.attachments as Array<Attachment>) ?? [],
      }));
    }


    const cookieStore = await cookies();
    const modelIdFromCookie = cookieStore.get('chat-model');
    const selectedChatModel = modelIdFromCookie ? modelIdFromCookie.value : DEFAULT_CHAT_MODEL;

    return (
      <ChatPageWrapper
        id={id}
        initialMessages={convertToUIMessages(messages)}
        selectedChatModel={selectedChatModel}
        selectedVisibilityType={chat.visibility as 'private' | 'public'}
        isReadonly={false}
        title={chat.title}
      />
    );
  } catch (error) {
    console.error('Error fetching chat:', error);
    redirect('/chat');
  }
}