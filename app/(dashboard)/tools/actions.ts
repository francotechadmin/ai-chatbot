'use server';

import { auth } from '@/app/(auth)/auth';
import { processDocument } from '@/lib/services/document-upload-service';
import { revalidatePath } from 'next/cache';

/**
 * Upload files to the knowledge base
 * @param formData FormData containing files to upload
 * @returns Array of processed documents
 */
export async function uploadFiles(formData: FormData) {
  try {
    // Get the authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error('Unauthorized');
    }

    const userId = session.user.id;
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    const results = [];

    // Process each file
    for (const file of files) {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Get additional metadata from form if available
      const metadata: Record<string, any> = {
        autoCategorize: formData.get('autoCategorize') === 'true',
        extractMetadata: formData.get('extractMetadata') === 'true',
        removeDuplicates: formData.get('removeDuplicates') === 'true',
      };

      // Process the document
      const result = await processDocument(
        userId,
        file.name,
        arrayBuffer,
        metadata
      );

      results.push(result);
    }

    // Revalidate the tools page to reflect the new uploads
    revalidatePath('/tools');
    
    return { success: true, sources: results };
  } catch (error) {
    console.error('Error uploading files:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}