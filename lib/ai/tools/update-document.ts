import { type DataStreamWriter, tool } from 'ai';
import type { Session } from 'next-auth';
import { z } from 'zod';
import { getDocumentById, } from '@/lib/db/queries';
import { documentHandlersByArtifactKind } from '@/lib/artifacts/server';
import { logger } from '@/lib/logger';

interface UpdateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const updateDocument = ({ session, dataStream }: UpdateDocumentProps) =>
  tool({
    description: 'Update a document with the given description.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      logger.info({ id, description }, 'Executing updateDocument tool');
      try {
        const document = await getDocumentById({ id });
        logger.info({ id, documentFound: !!document }, 'Document fetched');

        if (!document) {
          logger.warn({ id }, 'Document not found');
        return {
          error: 'Document not found',
        };
      }

      dataStream.writeData({
        type: 'clear',
        content: document.title,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === document.kind,
      );
      logger.info({ id, kind: document.kind, handlerFound: !!documentHandler }, 'Document handler search completed');

      if (!documentHandler) {
        logger.error({ id, kind: document.kind }, 'No document handler found for kind');
        throw new Error(`No document handler found for kind: ${document.kind}`);
      }

      logger.info({ id, kind: document.kind }, 'Updating document using handler');
      await documentHandler.onUpdateDocument({
        document,
        description,
        dataStream,
        session,
      });

      logger.info({ id, kind: document.kind }, 'Document updated successfully');
      dataStream.writeData({ type: 'finish', content: '' });

      const result = {
        id,
        title: document.title,
        kind: document.kind,
        content: 'The document has been updated successfully.',
      };
      logger.info({ id, result }, 'updateDocument tool executed successfully');
      return result;
     } catch (error: any) {
       logger.error({ id, description, error: error.message, stack: error.stack }, 'Error executing updateDocument tool');
       throw error; // Re-throw the error
     }
   },
 });
