'use server';

import { createKnowledgeChunk } from './db/queries';

/**
 * Splits text into chunks of approximately the specified size
 * @param text The text to split into chunks
 * @param chunkSize The target size of each chunk
 * @param overlap The number of characters to overlap between chunks
 * @returns An array of text chunks
 */
export async function splitTextIntoChunks(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): Promise<string[]> {
  if (!text) return [];
  
  // If text is smaller than chunk size, return it as a single chunk
  if (text.length <= chunkSize) {
    return [text];
  }
  
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Calculate end index for this chunk
    let endIndex = startIndex + chunkSize;
    
    // If we're not at the end of the text, try to find a good break point
    if (endIndex < text.length) {
      // Look for a period, question mark, or exclamation mark followed by a space or newline
      const breakMatch = text.substring(endIndex - 100, endIndex + 100).search(/[.!?]\s/);
      
      if (breakMatch !== -1) {
        // Found a good break point
        endIndex = endIndex - 100 + breakMatch + 2; // +2 to include the punctuation and space
      } else {
        // Look for a newline
        const newlineMatch = text.substring(endIndex - 50, endIndex + 50).search(/\n/);
        
        if (newlineMatch !== -1) {
          endIndex = endIndex - 50 + newlineMatch + 1; // +1 to include the newline
        } else {
          // Look for a space
          const spaceMatch = text.substring(endIndex - 30, endIndex + 30).search(/\s/);
          
          if (spaceMatch !== -1) {
            endIndex = endIndex - 30 + spaceMatch + 1; // +1 to include the space
          }
        }
      }
    }
    
    // Add the chunk
    chunks.push(text.substring(startIndex, endIndex));
    
    // Move the start index for the next chunk, accounting for overlap
    startIndex = endIndex - overlap;
  }
  
  return chunks;
}

/**
 * Generates embeddings for text using the OpenAI API
 * @param text The text to generate embeddings for
 * @returns The embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const result = await response.json();
    return result.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Processes text content into chunks and generates embeddings for each chunk
 * @param sourceId The ID of the knowledge source
 * @param content The text content to process
 * @param metadata Optional metadata to include with each chunk
 */
export async function processContentForKnowledgeBase(
  sourceId: string,
  content: string,
  metadata?: any
): Promise<void> {
  try {
    console.log('Processing content for knowledge base');
    
    // Split content into chunks
    const chunks = await splitTextIntoChunks(content);
    
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
        ...metadata,
        chunkIndex: i,
        totalChunks: chunks.length
      };
      
      // Save the chunk to the database
      await createKnowledgeChunk({
        sourceId,
        content: chunk,
        embedding,
        metadata: chunkMetadata
      });
    }
  } catch (error) {
    console.error('Error processing content for knowledge base:', error);
    throw error;
  }
}

/**
 * Calculates the cosine similarity between two vectors
 * @param a First vector
 * @param b Second vector
 * @returns The cosine similarity between the vectors
 */
export async function cosineSimilarity(a: number[], b: number[]): Promise<number> {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    throw new Error('Both inputs must be arrays');
  }
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
