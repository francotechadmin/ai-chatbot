'use server';

import { generateText, type Message } from 'ai';
import { cookies } from 'next/headers';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
  getChatsByUserId,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';
import type { Chat } from '@/lib/db/schema';
import { auth } from '@/app/(auth)/auth';


export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: Message;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

/**
 * Get chat history for a user
 * Replaces the /api/history route
 */
export async function getChatHistory(): Promise<Chat[]> {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const userId = session.user.id!;
  
  try {
    return await getChatsByUserId({ id: userId });
  } catch (error) {
    console.error('Failed to get chat history:', error);
    throw new Error('Failed to get chat history');
  }
}

