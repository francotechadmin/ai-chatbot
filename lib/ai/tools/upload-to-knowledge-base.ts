import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { createKnowledgeSource, getDocumentById } from '@/lib/db/queries';
import { processContentForKnowledgeBase } from '@/lib/embeddings';
import type { Document } from '@/lib/db/schema';

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
      // If documentId is provided, retrieve the document content
      if (documentId) {
        try {
          dataStream.writeData({
            type: 'status',
            content: `Retrieving document content for ID: ${documentId}...`,
          });
          
          try {
            // Get the document from the database
            const document = await getDocumentById({ id: documentId });
            
            if (!document) {
              // Log detailed error for debugging
              console.error(`Document with ID ${documentId} not found in database.`);
              dataStream.writeData({
                type: 'status',
                content: `Warning: Document with ID ${documentId} not found. Will use provided content instead.`,
              });
              
              // Don't throw error, just use the provided content
              if (content === "A document was created and is now visible to the user.") {
                throw new Error(`Document with ID ${documentId} not found. Please provide the actual content.`);
              }
              
              // Continue with the provided content
              dataStream.writeData({
                type: 'status',
                content: 'Using provided content instead of document content.',
              });
              
              // Don't modify content, use what was provided
            } else {
              // Document found, check if it has content
              if (!document.content) {
                console.error(`Document with ID ${documentId} has no content.`);
                dataStream.writeData({
                  type: 'status',
                  content: `Warning: Document with ID ${documentId} has no content. Will use provided content instead.`,
                });
                
                // Don't throw error, just use the provided content
                if (content === "A document was created and is now visible to the user.") {
                  throw new Error(`Document with ID ${documentId} has no content. Please provide the actual content.`);
                }
              } else {
                // Document has content, use it
                // TypeScript fix: access content property with type safety
                const docContent = (document as Document).content;
                content = docContent || '';
                dataStream.writeData({
                  type: 'status',
                  content: 'Retrieved document content successfully.',
                });
              }
            }
          } catch (error) {
            // Only throw if we can't proceed with the provided content
            if (content === "A document was created and is now visible to the user.") {
              console.error('Error retrieving document content:', error);
              throw new Error(`Failed to retrieve document content: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            
            // Otherwise, log the error but continue with provided content
            console.error('Error retrieving document content, using provided content instead:', error);
            dataStream.writeData({
              type: 'status',
              content: 'Using provided content instead of document content due to retrieval error.',
            });
          }
          // This line is not needed as we already set content in the try block
          // Removing to fix TypeScript error
          
          dataStream.writeData({
            type: 'status',
            content: 'Retrieved document content successfully.',
          });
        } catch (error) {
          console.error('Error retrieving document content:', error);
          throw new Error(`Failed to retrieve document content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      // Check if the content is a placeholder from createDocument
      else if (content === "A document was created and is now visible to the user." && metadata && metadata.documentId) {
        // For backward compatibility, try to get the document ID from metadata
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
          
          content = document.content;
          
          dataStream.writeData({
            type: 'status',
            content: 'Retrieved document content successfully.',
          });
        } catch (error) {
          console.error('Error retrieving document content:', error);
          throw new Error(`Failed to retrieve document content: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else if (content === "A document was created and is now visible to the user.") {
        // If we don't have a documentId, we can't retrieve the content
        throw new Error('Cannot access document content. Please provide the document ID using the documentId parameter or the actual content to upload to the knowledge base.');
      }
      if (!session.user?.id) {
        throw new Error('User not authenticated');
      }

      try {
        // Create a knowledge source entry
        dataStream.writeData({
          type: 'status',
          content: 'Creating knowledge source entry...',
        });

        const source = await createKnowledgeSource({
          title,
          description,
          sourceType,
          userId: session.user.id,
          metadata,
        });

        // Process the content (split into chunks and generate embeddings)
        dataStream.writeData({
          type: 'status',
          content: 'Processing document content...',
        });

        await processContentForKnowledgeBase(source.id, content, metadata);

        dataStream.writeData({
          type: 'status',
          content: `Document successfully added to knowledge base`
        });

        // Return data in a format that the UI component can handle
        return {
          title,
          sourceId: source.id,
          description,
          sourceType
        };
      } catch (error) {
        console.error('Error uploading to knowledge base:', error);
        throw new Error(`Failed to upload document to knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });