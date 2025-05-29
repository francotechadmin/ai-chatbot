import {
  type UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../chat/actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { uploadToKnowledgeBase } from '@/lib/ai/tools/upload-to-knowledge-base';
import { queryKnowledgeBase } from '@/lib/ai/tools/query-knowledge-base';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { logger } from '@/lib/logger'; // Assuming a shared logger utility

export const maxDuration = 60;

export async function POST(request: Request) {
  let id: string | undefined;
  let session: any; // Use 'any' for now, or import the correct Session type if available
  
  try {
    const body: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
    } = await request.json();

    id = body.id!; // Assert that id is a string
    const messageList = body.messages;
    logger.info({ messageListLength: messageList.length }, 'Message list received');

    const messages = messageList.filter(
      (message) => message.content.length >= 0,
    )
    logger.info({ messagesLength: messages.length }, 'Filtered message list');
    
    const selectedChatModel = body.selectedChatModel;

    session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }
    logger.info({ session: session?.user?.id }, 'Session information');

    const userMessage = getMostRecentUserMessage(messages);
    
    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }
    logger.info({ userMessageId: userMessage.id }, 'User message received');
    
    const chat = await getChatById({ id });
    logger.info({ chatId: id, chatExists: !!chat }, 'Chat information');

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      logger.info({ title }, 'Title generated');

      await saveChat({ id, userId: session.user.id, title });
      logger.info({ chatId: id }, 'Chat created');
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });
    logger.info({ chatId: id }, 'User message saved');
    
    return createDataStreamResponse({
      execute: (dataStream) => {
        logger.info({ chatId: id }, 'Chat started');
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'uploadToKnowledgeBase',
                  'queryKnowledgeBase',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            uploadToKnowledgeBase: uploadToKnowledgeBase({
              session,
              dataStream,
            }),
            queryKnowledgeBase: queryKnowledgeBase({
              session,
              dataStream,
            }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id as string, // Assert id as string
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (error: any) {
                logger.error({ chatId: id, userId: session?.user?.id, error: error.message, stack: error.stack }, 'Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error: unknown) => {
        logger.error({ chatId: id, userId: session?.user?.id, error: error }, 'An error occurred in POST handler');
        return 'Oops, an error occured!'; // Still return a generic message to the client
      },
    });
  } catch (error: any) {
    logger.error({ chatId: id, userId: session?.user?.id, error: error.message, stack: error.stack }, 'An error occurred in POST handler');
    return new Response('An error occurred while processing your request!', {
      status: 500, // Changed status to 500 for internal server error
    });
  }
}

export async function DELETE(request: Request) {
  logger.info('DELETE request received');
  const { searchParams } = new URL(request.url);
  logger.info({ searchParams }, 'Search parameters');
  const id = searchParams.get('id');

  if (!id) {
    logger.error('Missing id', 'DELETE handler');
    return new Response('Not Found', { status: 404 });
  }

  logger.info({ id }, 'Chat ID');

  const session = await auth();

  if (!session || !session.user) {
    logger.error('Unauthorized', 'DELETE handler');
    return new Response('Unauthorized', { status: 401 });
  }

  logger.info({ userId: session.user.id }, 'User ID');

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      logger.error('Unauthorized', 'DELETE handler');
      return new Response('Unauthorized', { status: 401 });
    }

    logger.info({ chatId: id }, 'Chat found');

    await deleteChatById({ id });
    logger.info({ chatId: id }, 'Chat deleted');

    return new Response('Chat deleted', { status: 200 });
  } catch (error: any) {
    logger.error({ chatId: id, userId: session?.user?.id, error: error.message, stack: error.stack }, 'An error occurred in DELETE handler');
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

