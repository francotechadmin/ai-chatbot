import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleDriveClient, GoogleDriveFile } from '@/lib/integrations/google/drive';
import { GoogleProcessorFactory } from '@/lib/integrations/google/processors/processor-factory';
import { db } from '@/lib/db';
import { googleIntegration, knowledgeSource, knowledgeChunk } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { splitTextIntoChunks } from '@/lib/embeddings';
import { generateEmbedding } from '@/lib/embeddings';
import { auth } from '@/app/(auth)/auth';

// Input validation schema
const importRequestSchema = z.object({
  fileIds: z.array(z.string()).min(1),
  // Allow knowledgeBaseId to be any string or undefined - we'll ignore it anyway
  knowledgeBaseId: z.string().optional(),
});

/**
 * POST handler to import files from Google Drive into the knowledge base
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await req.json();
    const { fileIds } = importRequestSchema.parse(body);
    // We're ignoring knowledgeBaseId since we only have one knowledge base

    // Get the current user ID from the session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the Google auth credentials for the user
    const userIntegration = await db.query.googleIntegration.findFirst({
      where: eq(googleIntegration.userId, userId),
    });

    if (!userIntegration) {
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 404 });
    }

    // Check if the access token is expired and refresh if necessary
    if (userIntegration.expiresAt && userIntegration.expiresAt < new Date() && userIntegration.refreshToken) {
      const { GoogleAuth } = await import('@/lib/integrations/google/auth');
      
      // Get credentials from DB if user provided them
      const credentials = userIntegration.clientId && userIntegration.clientSecret 
        ? { clientId: userIntegration.clientId, clientSecret: userIntegration.clientSecret } 
        : undefined;
        
      const newTokens = await GoogleAuth.refreshAccessToken(userIntegration.refreshToken, credentials);
      
      // Update the tokens in the database
      await db.update(googleIntegration)
        .set({
          accessToken: newTokens.access_token,
          expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
          updatedAt: new Date()
        })
        .where(eq(googleIntegration.id, userIntegration.id));
      
      // Use the new access token
      userIntegration.accessToken = newTokens.access_token;
    }

    // Initialize Google Drive client with the access token
    const driveClient = new GoogleDriveClient(userIntegration.accessToken);

    // Process each file
    const importResults = await Promise.all(
      fileIds.map(async (fileId) => {
        try {
          // Get the file metadata
          const file = await driveClient.getFile(fileId);
          
          // Create processor for the specific file type
          const processor = GoogleProcessorFactory.createProcessor(driveClient, file);
          
          // Extract text from the file
          const text = await processor.extractText();
          
          // Skip if no text content
          if (!text || text.trim().length === 0) {
            return {
              fileId,
              fileName: file.name,
              status: 'skipped',
              reason: 'No text content found',
            };
          }
          
          // Prepare metadata for the source
          const metadata = processor.getMetadata();
          
          // Create a source record in the database
          const [sourceResult] = await db.insert(knowledgeSource)
            .values({
              id: crypto.randomUUID(),
              title: file.name,
              sourceType: 'document',
              description: `Imported from Google Drive: ${file.name}`,
              userId: userId,
              status: 'approved',
              createdAt: new Date(),
              updatedAt: new Date(),
              metadata: {
                fileId: file.id,
                mimeType: file.mimeType,
                webViewLink: file.webViewLink || null,
                createdTime: file.createdTime || null,
                modifiedTime: file.modifiedTime || null,
                size: file.size || null,
                provider: 'google_drive'
              }
            })
            .returning();

          // Split the content into chunks for embeddings
          const chunks = splitTextIntoChunks(text);
          
          // Process each chunk
          const resolvedChunks = await chunks;
          for (const [index, chunk] of resolvedChunks.entries()) {
            // Generate embedding for this chunk
            const embedding = await generateEmbedding(chunk);
            
            // Store the chunk and its embedding
            await db.insert(knowledgeChunk)
              .values({
                id: crypto.randomUUID(),
                content: chunk,
                embedding,
                sourceId: sourceResult.id,
                metadata: { 
                  chunkIndex: index,
                  position: `chunk ${index + 1} of ${resolvedChunks.length}`
                },
                createdAt: new Date()
              });
          }

          return {
            fileId,
            fileName: file.name,
            sourceId: sourceResult.id,
            status: 'imported',
            chunkCount: (await chunks).length,
          };
        } catch (error) {
          console.error(`Error processing file ${fileId}:`, error);
          return {
            fileId,
            status: 'error',
            error: error.message || 'Unknown error',
          };
        }
      })
    );

    return NextResponse.json({ 
      success: true,
      imported: importResults.filter(r => r.status === 'imported').length,
      skipped: importResults.filter(r => r.status === 'skipped').length,
      failed: importResults.filter(r => r.status === 'error').length,
      results: importResults,
    });
  } catch (error) {
    console.error('Error importing Google Drive files:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import files' },
      { status: error.status || 500 }
    );
  }
}