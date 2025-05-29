import { z } from 'zod';
import type { Session } from 'next-auth';
import { type DataStreamWriter, streamObject, tool } from 'ai';
import { getDocumentById, saveSuggestions } from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { myProvider } from '../providers';
import { logger } from '@/lib/logger';

interface RequestSuggestionsProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: 'Request suggestions for a document',
    parameters: z.object({
      documentId: z
        .string()
        .describe('The ID of the document to request edits'),
    }),
    execute: async ({ documentId }) => {
      logger.info({ documentId }, 'Executing requestSuggestions tool');
      try {
        const document = await getDocumentById({ id: documentId });
        logger.info({ documentId, documentFound: !!document }, 'Document fetched');

        if (!document || !document.content) {
          logger.warn({ documentId }, 'Document not found or has no content');
        return {
          error: 'Document not found',
        };
      }

      const suggestions: Array<
        Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
      > = [];

      logger.info({ documentId }, 'Requesting suggestions from AI model');
      const { elementStream } = streamObject({
        model: myProvider.languageModel('artifact-model'),
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      for await (const element of elementStream) {
        logger.info({ documentId, suggestion: element }, 'Received suggestion from stream');
        const suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        dataStream.writeData({
          type: 'suggestion',
          content: suggestion,
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        const userId = session.user.id;

        logger.info({ documentId, suggestionCount: suggestions.length }, 'Saving suggestions');
        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
          })),
        });
      }

      logger.info({ documentId, suggestionCount: suggestions.length }, 'Suggestions saved successfully');

      const result = {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
      };
      logger.info({ documentId, result }, 'requestSuggestions tool executed successfully');
      return result;
      } catch (error: any) {
        logger.error({ documentId, error: error.message, stack: error.stack }, 'Error executing requestSuggestions tool');
        throw error; // Re-throw the error
      }
    },
  });
