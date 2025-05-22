'use server';

import { auth } from '@/app/(auth)/auth';
import { createKnowledgeSource, getMessagesByChatId, getChatById } from '@/lib/db/queries';
import { processContentForKnowledgeBase } from '@/lib/embeddings';

/**
 * Submits a capture session to the knowledge base
 * @param chatId The ID of the capture session chat
 * @param title Optional custom title for the knowledge source
 * @param description Optional description for the knowledge source
 * @returns The created knowledge source
 */
export async function submitCaptureToKnowledgeBase({
  chatId,
  title,
  description,
}: {
  chatId: string;
  title?: string;
  description?: string;
}) {
  try {
    // Get the current user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      throw new Error('Unauthorized');
    }

    // Get the chat
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Verify the chat belongs to the user
    if (chat.userId !== session.user.id) {
      throw new Error('Unauthorized');
    }

    // Verify the chat is a capture session
    if (chat.type !== 'capture') {
      throw new Error('Not a capture session');
    }

    // Get all messages from the chat
    const messages = await getMessagesByChatId({ id: chatId });
    if (!messages || messages.length === 0) {
      throw new Error('No messages found in chat');
    }

    // Extract text content from messages
    const content = messages.map(message => {
      // Process message parts
      if (message.parts && Array.isArray(message.parts)) {
        return message.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join('\n\n');
      }
      // Fallback for any other message format
      return '';
    }).join('\n\n');

    // Use the chat title or a custom title
    const knowledgeTitle = title || chat.title;

    // Create a knowledge source
    const source = await createKnowledgeSource({
      title: knowledgeTitle,
      description: description || `Capture session from ${new Date(chat.createdAt).toLocaleDateString()}`,
      sourceType: 'chat',
      sourceId: chatId,
      userId: session.user.id,
      metadata: {
        chatId,
        messageCount: messages.length,
        createdAt: chat.createdAt,
      },
    });

    // Process the content for the knowledge base
    await processContentForKnowledgeBase(
      source.id,
      content,
      {
        chatId,
        sourceType: 'capture',
      }
    );

    return source;
  } catch (error) {
    console.error('Error submitting capture to knowledge base:', error);
    throw error;
  }
}
