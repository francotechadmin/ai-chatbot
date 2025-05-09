import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';
import { ChatPageWrapper } from '@/components/chat-page-wrapper';

export default async function QueryChatPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat || chat.type !== 'query') {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

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
  const chatModelFromCookie = cookieStore.get('chat-model');
  const selectedChatModel = chatModelFromCookie ? chatModelFromCookie.value : DEFAULT_CHAT_MODEL;
  const isReadonly = session?.user?.id !== chat.userId;

  return (
    <ChatPageWrapper
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedChatModel={selectedChatModel}
      selectedVisibilityType={chat.visibility}
      isReadonly={isReadonly}
      chatType="query"
      title={chat.title || "Knowledge Query"}
    />
  );
}
