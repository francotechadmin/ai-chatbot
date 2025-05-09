import type { DocumentProcessor } from './document-processor';
import { TextProcessor } from './text-processor';
import { DocxProcessor } from './docx-processor';
import { PdfProcessor } from './pdf-processor';

/**
 * Functions for creating document processors based on file type
 */

/**
 * Get the appropriate processor for a file
 * @param userId The user ID
 * @param fileName The file name
 * @param metadata Additional metadata
 * @returns The appropriate document processor
 */
export function getProcessor(
  userId: string,
  fileName: string,
  metadata: Record<string, any> = {}
): DocumentProcessor {
    // Get file extension
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    // Select processor based on file extension
    switch(extension) {
      case 'docx':
        return new DocxProcessor(userId, metadata);
      case 'pdf':
        return new PdfProcessor(userId, metadata);
      case 'txt':
      case 'md':
      case 'csv':
      case 'json':
      case 'xml':
      case 'html':
      case 'htm':
      case 'js':
      case 'ts':
      case 'css':
      default:
        return new TextProcessor(userId, metadata);
    }
}