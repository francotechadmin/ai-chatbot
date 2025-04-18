import { type UIMessage } from 'ai';
import { getChatById, saveChat } from '@/lib/db/queries';

/**
 * Validates a user message to ensure it has valid content
 * @param userMessage The user message to validate
 * @returns An object indicating if the message is valid and an optional error message
 */
export function validateUserMessage(userMessage: UIMessage | undefined): { 
  isValid: boolean; 
  errorMessage?: string; 
} {
  if (!userMessage) {
    console.error('No user message found in the request');
    return { isValid: false, errorMessage: 'No user message found' };
  }

  // Validate that the user message has content
  if (!userMessage.content && (!userMessage.parts || userMessage.parts.length === 0)) {
    console.error('User message has no content:', JSON.stringify(userMessage));
    return { isValid: false, errorMessage: 'User message has no content' };
  }

  // Ensure the message has parts if content is empty
  if (!userMessage.content && Array.isArray(userMessage.parts)) {
    const hasValidContent = userMessage.parts.some(part => 
      (part.type === 'text' && part.text && part.text.trim() !== '') || 
      (part.type !== 'text' && part)
    );
    
    if (!hasValidContent) {
      console.error('User message has no valid content in parts:', JSON.stringify(userMessage));
      return { isValid: false, errorMessage: 'User message has no valid content' };
    }
  }

  console.log('Processing user message:', JSON.stringify(userMessage));
  return { isValid: true };
}

/**
 * Processes messages to ensure they have valid content for the AI provider
 * @param messages Array of messages to process
 * @returns Processed messages with valid content
 */
export function processMessages(messages: Array<UIMessage>): Array<UIMessage> {
  return messages.map(message => {
    // For messages with content, ensure it's not empty
    if (message.content === '') {
      message.content = ' '; // Minimum non-empty content
    }
    
    // For messages with parts but no content
    if (!message.content && Array.isArray(message.parts) && message.parts.length > 0) {
      // Extract text from parts
      const textContent = message.parts
        .filter(part => part.type === 'text')
        .map(part => (part.type === 'text' ? part.text : ''))
        .join(' ');
      
      // Use extracted text or a placeholder
      message.content = textContent || ' ';
    }
    
    // Ensure every message has content
    if (!message.content) {
      message.content = ' ';
    }
    
    // Log the processed message for debugging
    console.log('Processed message:', JSON.stringify({
      role: message.role,
      content: message.content,
      hasContent: !!message.content,
      hasEmptyContent: message.content === '',
      hasNullContent: message.content === null,
      contentType: typeof message.content
    }));
    
    return message;
  });
}

/**
 * Handles chat authorization and creation if needed
 * @param params Object containing id, userId, userMessage, and chatType
 * @returns An object indicating if the user is authorized and an optional error message
 */
export async function handleChatAuthorization({
  id,
  userId,
  userMessage,
  chatType,
  generateTitle
}: {
  id: string;
  userId: string;
  userMessage: UIMessage;
  chatType: 'general' | 'query' | 'capture';
  generateTitle: (params: { message: UIMessage }) => Promise<string>;
}): Promise<{ isAuthorized: boolean; errorMessage?: string }> {
  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitle({
      message: userMessage,
    });

    await saveChat({ id, userId, title, type: chatType });
    return { isAuthorized: true };
  } else {
    if (chat.userId !== userId) {
      return { isAuthorized: false, errorMessage: 'Unauthorized' };
    }
    return { isAuthorized: true };
  }
}

/**
 * Handles API errors with consistent logging and response format
 * @param error The error object
 * @param context A string describing the context of the error
 * @returns A Response object with an error message
 */
export function handleApiError(error: any, context: string): Response {
  console.error(`${context} error:`, error);
  return new Response('An error occurred while processing your request!', {
    status: 404,
  });
}
