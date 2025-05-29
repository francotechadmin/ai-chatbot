import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { searchKnowledgeBase } from '@/lib/embeddings';
import { logger } from '@/lib/logger';

interface QueryKnowledgeBaseProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const queryKnowledgeBase = ({ session, dataStream }: QueryKnowledgeBaseProps) =>
  tool({
    description:
      'Query the knowledge base to retrieve relevant information. This tool searches the knowledge base for content related to the query and returns the most relevant results.',
    parameters: z.object({
      query: z.string().describe('The search query to find relevant information in the knowledge base'),
      limit: z.number().min(1).max(20).default(5).describe('Maximum number of results to return (1-20)'),
      minSimilarity: z.number().min(0).max(1).default(0.4).describe('Minimum similarity score (0-1) for results'),
    }),
    execute: async ({ query, limit, minSimilarity }) => {
      logger.info({ query, limit, minSimilarity }, 'Executing queryKnowledgeBase tool');
      try {
        dataStream.writeData({
          type: 'status',
          content: 'Searching knowledge base...',
        });

        logger.info({ query, limit, minSimilarity }, 'Searching knowledge base');
        const searchResults = await searchKnowledgeBase(query, limit, minSimilarity);
        logger.info({ query, resultCount: searchResults.length }, 'Knowledge base search completed');

        if (searchResults.length === 0) {
          logger.info({ query }, 'No relevant information found in knowledge base');
          dataStream.writeData({
            type: 'status',
            content: 'No relevant information found in knowledge base',
          });
          
          return "No relevant information was found in the knowledge base.";
        }
        
        dataStream.writeData({
          type: 'status',
          content: `Found ${searchResults.length} relevant results in the knowledge base`
        });
        
        // Define types for our grouped data
        type ChunkData = {
          content: string;
          similarity: number;
        };
        
        type SourceData = {
          sourceId: string;
          title: string;
          sourceType: string;
          chunks: ChunkData[];
        };
        
        // Group results by source ID to avoid duplicate documents in the list
        const sourceMap = new Map<string, SourceData>();
        
        // First, collect all chunks by source
        searchResults.forEach(result => {
          const sourceId = result.source.id;
          if (!sourceMap.has(sourceId)) {
            sourceMap.set(sourceId, {
              sourceId,
              title: result.source.title,
              sourceType: result.source.sourceType,
              chunks: [],
            });
          }
          
          sourceMap.get(sourceId)?.chunks.push({
            content: result.chunk.content,
            similarity: result.similarity
          });
        });
        
        // Convert the map to an array of unique sources with their chunks
        const uniqueSources = Array.from(sourceMap.values());
        
        // Sort sources by the highest similarity score among their chunks
        uniqueSources.sort((a, b) => {
          const aMaxSimilarity = Math.max(...a.chunks.map((chunk: ChunkData) => chunk.similarity));
          const bMaxSimilarity = Math.max(...b.chunks.map((chunk: ChunkData) => chunk.similarity));
          return bMaxSimilarity - aMaxSimilarity;
        });
        
        // Create two separate objects:
        // 1. UI results for display (links only)
        // 2. Content results for the AI to use
        
        // Format the results for UI display (one entry per document)
        const uiResults = uniqueSources.map(source => {
          return {
            title: source.title,
            sourceLink: `/knowledge-base/${source.sourceId}`,
            matchCount: source.chunks.length
          };
        });
        
        // Format the content for the AI to use
        const contentForAI = uniqueSources.map(source => {
          return {
            title: source.title,
            content: source.chunks.map((chunk: ChunkData) => chunk.content).join('\n\n')
          };
        });
        
        // Return a special object that includes both UI results and content
        const result = {
          uiResults: uiResults,
          contentResults: contentForAI,
          // This is what will be displayed in the UI component
          _display: "uiResults",
          // Include a summary for the AI to use
          summary: `Found ${uniqueSources.length} relevant documents in the knowledge base. The documents contain information about: ${contentForAI.map(doc => doc.title).join(', ')}. The content of these documents is available in the contentResults property.`
        };
        logger.info({ query, resultSummary: result.summary }, 'queryKnowledgeBase tool executed successfully');
        return result;
      } catch (error: any) {
        logger.error({ query, error: error.message, stack: error.stack }, 'Error executing queryKnowledgeBase tool');
        throw new Error(`Failed to query knowledge base: ${error.message}`);
      }
    },
  });