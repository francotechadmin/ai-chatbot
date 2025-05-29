import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { createKnowledgeSource, getDocumentById } from '@/lib/db/queries';
import { processContentForKnowledgeBase } from '@/lib/embeddings';
import { logger } from '@/lib/logger';

interface UploadToKnowledgeBaseProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const uploadToKnowledgeBase = ({ session, dataStream }: UploadToKnowledgeBaseProps) =>
  tool({
    description:
      'Upload a document to the knowledge base. This tool processes the document content, splits it into chunks, generates embeddings, and stores it in the knowledge base for future retrieval. When uploading a document created with createDocument, use the documentId parameter.',
    parameters: z.object({
      title: z.string().describe('The title of the document'),
      content: z.string().describe('The text content to be added to the knowledge base. For documents created with createDocument, this can be the same content returned by createDocument.'),
      description: z.string().optional().describe('Optional description of the document'),
      sourceType: z.enum(['document', 'chat', 'image', 'video', 'webpage', 'api']).default('document').describe('The type of source'),
      documentId: z.string().optional().describe('The ID of a document created with createDocument. If provided, the content will be retrieved from the document.'),
      metadata: z.record(z.any()).optional().describe('Optional metadata about the document'),
    }),
    execute: async ({ title, content, description, sourceType, documentId, metadata }) => {
      logger.info({ title, sourceType, documentId, metadata }, 'Executing uploadToKnowledgeBase tool');

      let documentContent = content; // Use a new variable to hold the content, initialized with the provided content

      // If documentId is provided, retrieve the document content
      if (documentId) {
        logger.info({ documentId }, 'Document ID provided, attempting to retrieve document content');
        try {
          dataStream.writeData({
            type: 'status',
            content: `Retrieving document content for ID: ${documentId}...`,
          });

          const document = await getDocumentById({ id: documentId });

          if (!document) {
            logger.warn({ documentId }, 'Document not found in database.');
            dataStream.writeData({
              type: 'status',
              content: `Warning: Document with ID ${documentId} not found. Will use provided content instead.`,
            });
            // If the provided content is the placeholder, throw an error
            if (documentContent === "A document was created and is now visible to the user.") {
              throw new Error(`Document with ID ${documentId} not found. Please provide the actual content.`);
            }
          } else if (!document.content) {
            logger.warn({ documentId }, 'Document has no content.');
            dataStream.writeData({
              type: 'status',
              content: `Warning: Document with ID ${documentId} has no content. Will use provided content instead.`,
            });
            // If the provided content is the placeholder, throw an error
            if (documentContent === "A document was created and is now visible to the user.") {
              throw new Error(`Document with ID ${documentId} has no content. Please provide the actual content.`);
            }
          } else {
            // Document found and has content, use it
            documentContent = document.content;
            dataStream.writeData({
              type: 'status',
              content: 'Retrieved document content successfully.',
            });
            logger.info({ documentId }, 'Retrieved document content successfully.');
          }
        } catch (error: any) {
          logger.error({ documentId, error: error.message, stack: error.stack }, 'Error retrieving document content');
          throw new Error(`Failed to retrieve document content: ${error.message}`);
        }
      } else if (documentContent === "A document was created and is now visible to the user." && metadata && metadata.documentId) {
        // For backward compatibility, try to get the document ID from metadata if content is placeholder
        logger.info({ metadataDocumentId: metadata.documentId }, 'Placeholder content detected, attempting to retrieve document content from metadata');
        try {
          dataStream.writeData({
            type: 'status',
            content: `Retrieving document content for ID: ${metadata.documentId}...`,
          });

          const document = await getDocumentById({ id: metadata.documentId });

          if (!document) {
            throw new Error(`Document with ID ${metadata.documentId} not found.`);
          }

          if (!document.content) {
            throw new Error(`Document with ID ${metadata.documentId} has no content.`);
          }

          documentContent = document.content;

          dataStream.writeData({
            type: 'status',
            content: 'Retrieved document content successfully.',
          });
          logger.info({ metadataDocumentId: metadata.documentId }, 'Retrieved document content from metadata successfully.');
        } catch (error: any) {
          logger.error({ metadataDocumentId: metadata?.documentId, error: error.message, stack: error.stack }, 'Error retrieving document content from metadata');
          throw new Error(`Failed to retrieve document content: ${error.message}`);
        }
      } else if (documentContent === "A document was created and is now visible to the user.") {
        logger.error('Placeholder content detected without document ID');
        // If we don't have a documentId, we can't retrieve the content
        throw new Error('Cannot access document content. Please provide the document ID using the documentId parameter or the actual content to upload to the knowledge base.');
      }

      if (!session.user?.id) {
        logger.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      try { // Wrap the main logic in a try...catch
        // Create a knowledge source entry
        dataStream.writeData({
          type: 'status',
          content: 'Creating knowledge source entry...',
        });
        logger.info({ title, sourceType }, 'Creating knowledge source entry');

        const source = await createKnowledgeSource({
          title,
          description,
          sourceType,
          userId: session.user.id,
          metadata,
        });
        logger.info({ sourceId: source.id, title, sourceType }, 'Knowledge source entry created');


        // Process the content (split into chunks and generate embeddings)
        dataStream.writeData({
          type: 'status',
          content: 'Processing document content...',
        });
        logger.info({ sourceId: source.id }, 'Processing document content for knowledge base');

        await processContentForKnowledgeBase(source.id, documentContent, metadata);
        logger.info({ sourceId: source.id }, 'Document content processed successfully');


        dataStream.writeData({
          type: 'status',
          content: `Document successfully added to knowledge base`
        });
        logger.info({ sourceId: source.id }, 'Document successfully added to knowledge base');


        // Return data in a format that the UI component can handle
        const result = {
          title,
          sourceId: source.id,
          description,
          sourceType
        };
        logger.info({ sourceId: source.id, result }, 'uploadToKnowledgeBase tool executed successfully');
        return result;
      } catch (error: any) {
        logger.error({ title, sourceType, documentId, error: error.message, stack: error.stack }, 'Error during knowledge base upload process');
        throw new Error(`Failed to upload document to knowledge base: ${error.message}`);
      }
    },
  });