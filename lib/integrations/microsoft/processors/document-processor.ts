import { createKnowledgeSource, createKnowledgeChunk } from '@/lib/db/queries';
import { processContentForKnowledgeBase } from '@/lib/embeddings';

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
    
    // Process and chunk the content
    const chunks = await processContentForKnowledgeBase(text);
    
    // Store chunks with embeddings
    for (const chunk of chunks) {
      await createKnowledgeChunk({
        sourceId: source.id,
        content: chunk.content,
        embedding: chunk.embedding,
        metadata: chunk.metadata,
      });
    }
    
    return source;
  }
}