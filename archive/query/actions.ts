'use server';

import { generateText, type Message } from 'ai';
import { cookies } from 'next/headers';
import { auth } from '@/app/(auth)/auth';
import { revalidatePath } from 'next/cache';

import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
  getChatsByUserId,
  getChatsByUserIdAndType,
  getChatById,
  getMessagesByChatId,
  deleteChatById
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import type { Chat } from '@/lib/db/schema';
import { myProvider } from '@/lib/ai/providers';

/**
 * Save the selected chat model as a cookie
 */
export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

/**
 * Generate a title for a chat based on the first user message
 */
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

/**
 * Delete trailing messages after a specific message
 */
export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

/**
 * Update the visibility of a chat
 */
export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
  revalidatePath('/query');
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

/**
 * Get messages for a specific chat
 * Replaces the /api/chat/messages route
 */
export async function getChatMessages(chatId: string) {
  if (!chatId) {
    throw new Error('Chat ID is required');
  }

  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  try {
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.userId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    return await getMessagesByChatId({ id: chatId });
  } catch (error) {
    console.error('Failed to get chat messages:', error);
    throw new Error('Failed to get chat messages');
  }
}

/**
 * Delete a chat session
 * Replaces the DELETE method in /api/chat route
 */
export async function deleteChat(chatId: string) {
  if (!chatId) {
    throw new Error('Chat ID is required');
  }

  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  try {
    const chat = await getChatById({ id: chatId });

    if (!chat) {
      throw new Error('Chat not found');
    }

    if (chat.userId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    await deleteChatById({ id: chatId });
    revalidatePath('/query');
    
    return { success: true, message: 'Chat deleted successfully' };
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw new Error('Failed to delete chat');
  }
}
