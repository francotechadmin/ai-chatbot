import { createKnowledgeSource, createKnowledgeChunk } from '@/lib/db/queries';
import { splitTextIntoChunks, generateEmbedding } from '@/lib/embeddings';

/**
 * Base class for processing documents from Microsoft integrations
 */
export abstract class DocumentProcessor {
  protected userId: string;
  protected metadata: Record<string, any>;
  
  constructor(userId: string, metadata: Record<string, any> = {}) {
    this.userId = userId;
    this.metadata = metadata;
  }
  
  /**
   * Extract text content from a document
   * @param content Document content as ArrayBuffer
   * @returns Extracted text
   */
  abstract extractText(content: ArrayBuffer): Promise<string>;
  
  /**
   * Process a document and store it in the knowledge base
   * @param content Document content
   * @param title Document title
   * @param description Document description
   * @returns Created knowledge source
   */
  async processDocument(
    content: ArrayBuffer,
    title: string,
    description?: string
  ) {
    try {
      // Extract text from the document
      const text = await this.extractText(content);
      
      // Create knowledge source
      const source = await createKnowledgeSource({
        title,
        description,
        sourceType: 'document',
        userId: this.userId,
        metadata: this.metadata,
      });
      
      // Process content and create chunks directly in the database
      // Split content into chunks and process them
      const chunks = await splitTextIntoChunks(text);
      
      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Generate embedding for the chunk
        let embedding;
        try {
          embedding = await generateEmbedding(chunk);
        } catch (error) {
          console.error(`Error generating embedding for chunk ${i}:`, error);
          // Continue without embedding if there's an error
        }
        
        // Create chunk metadata
        const chunkMetadata = {
          ...this.metadata,
          chunkIndex: i,
          totalChunks: chunks.length
        };
        
        // Save the chunk to the database
        await createKnowledgeChunk({
          sourceId: source.id,
          content: chunk,
          embedding,
          metadata: chunkMetadata
        });
      }
      
      return source;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  }
}