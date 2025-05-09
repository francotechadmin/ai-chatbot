import {
  type UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt, queryPrompt } from '@/lib/ai/prompts';
import { searchKnowledgeBase } from '@/lib/embeddings';
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
import {
  handleApiError,
  handleChatAuthorization,
  processMessages,
  validateUserMessage
} from '@/lib/chat-utils';
import { generateTitleFromUserMessage } from '@/app/(dashboard)/query/actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { recordQueryMetric } from '@/lib/services/metrics-service';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
      chatType = 'query',
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
      chatType?: 'general' | 'query' | 'capture';
    } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);
    
    // Validate the user message
    const validation = validateUserMessage(userMessage);
    if (!validation.isValid) {
      return new Response(validation.errorMessage, { status: 400 });
    }

    // At this point, userMessage is guaranteed to be defined since validation passed
    const validUserMessage = userMessage as UIMessage;

    // Handle chat authorization and creation
    const authorization = await handleChatAuthorization({
      id,
      userId: session.user.id,
      userMessage: validUserMessage,
      chatType,
      generateTitle: generateTitleFromUserMessage
    });
    
    if (!authorization.isAuthorized) {
      return new Response(authorization.errorMessage, { status: 401 });
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: validUserMessage.id,
          role: 'user',
          parts: validUserMessage.parts,
          attachments: validUserMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    // Process messages to ensure they have valid content
    const processedMessages = processMessages(messages);

    // Extract query text from the user message
    const queryText = validUserMessage.parts
      .filter(part => part.type === 'text')
      .map(part => part.text)
      .join(' ');

    // Search knowledge base for relevant chunks
    let knowledgeContext = '';
    let knowledgeSourceIds: string[] = [];
    const searchStartTime = Date.now();
    
    try {
      const searchResults = await searchKnowledgeBase(queryText, 10, 0.4);
      const searchEndTime = Date.now();
      
      if (searchResults.length > 0) {
        console.log(
          `Found ${searchResults.length} relevant knowledge chunks for query: "${queryText}"`,
        );
        console.log(
          'Knowledge chunks:',
          searchResults.map(result => ({
            id: result.chunk.id,
            content: result.chunk.content,
            source: result.source.title,
            similarity: result.similarity,
          })),
        );
        
        // Collect source IDs for metrics
        knowledgeSourceIds = searchResults.map(result => result.source.id);
        
        // Record knowledge base search metric - ensure it's non-blocking
        void recordQueryMetric({
          chatId: id,
          userId: session.user.id,
          queryText,
          responseTime: searchEndTime - searchStartTime,
          knowledgeBaseUsed: true,
          knowledgeSourceIds,
          metadata: {
            resultCount: searchResults.length,
            operation: 'search',
          }
        });
        // Format knowledge chunks for context
        knowledgeContext = `
            Relevant information from knowledge base:

            ${searchResults.map((result, index) => {
              return `[Source ${result.source.title}] [Link: /knowledge-base/${result.source.id}]
            ${result.chunk.content}
            `;
            }).join('\n')}

            Use the above information to help answer the user's query. Cite sources titles when using information from the knowledge base. When citing sources, include the link in the format "/knowledge-base/[source-id]".
            `;
      }
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      // Continue without knowledge context if search fails
    }

    // Create custom system prompt with knowledge context
    const customSystemPrompt = chatType === 'query' 
      ? `${systemPrompt({ selectedChatModel, chatType })}\n\n${knowledgeContext}`
      : systemPrompt({ selectedChatModel, chatType });

    // Start timing the query processing
    const queryStartTime = Date.now();
    
    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: customSystemPrompt,
          messages: processedMessages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
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
                  messages: [validUserMessage],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
                
                // Record query metrics after completion
                const queryEndTime = Date.now();
                const responseTime = queryEndTime - queryStartTime;
                
                // Calculate token counts if available
                const promptTokens = response.usage?.promptTokens;
                const completionTokens = response.usage?.completionTokens;
                const totalTokens = promptTokens && completionTokens
                  ? promptTokens + completionTokens
                  : undefined;
                
                // Record the query metric - ensure it's non-blocking
                void recordQueryMetric({
                  chatId: id,
                  userId: session.user.id,
                  messageId: assistantId,
                  queryText,
                  responseTime,
                  tokenCount: totalTokens,
                  promptTokens,
                  completionTokens,
                  modelUsed: selectedChatModel,
                  knowledgeBaseUsed: knowledgeSourceIds.length > 0,
                  knowledgeSourceIds: knowledgeSourceIds.length > 0 ? knowledgeSourceIds : undefined,
                  metadata: {
                    chatType,
                  }
                });
              } catch (error) {
                console.error('Failed to save chat or record metrics:', error);
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
      onError: (error) => {
        console.error('Query chat stream error:', error);
        return 'Oops, an error occurred!';
      },
    });
  } catch (error) {
    return handleApiError(error, 'Query chat');
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return handleApiError(error, 'Query chat delete');
  }
}
