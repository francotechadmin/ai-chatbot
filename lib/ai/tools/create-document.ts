import { generateUUID } from '@/lib/utils';
import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';
import { logger } from '@/lib/logger';

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
    }),
    execute: async ({ title, kind }) => {
      logger.info({ title, kind }, 'Executing createDocument tool');
      try {
       const id = generateUUID();

       dataStream.writeData({
         type: 'kind',
        content: kind,
      });

      dataStream.writeData({
        type: 'id',
        content: id,
      });

      dataStream.writeData({
        type: 'title',
        content: title,
      });

      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        logger.error({ kind }, 'No document handler found for kind');
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      logger.info({ id, kind }, 'Document handler found, creating document');
      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
      });

      logger.info({ id, kind }, 'Document created successfully');
      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
     } catch (error: any) {
       logger.error({ title, kind, error: error.message, stack: error.stack }, 'Error executing createDocument tool');
       throw error; // Re-throw the error so the AI framework can handle it
     }
    },
  });
