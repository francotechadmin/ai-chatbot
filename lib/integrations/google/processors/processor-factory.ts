import { GoogleDriveClient, GoogleDriveFile } from '../drive';
import { GoogleDocumentProcessor } from './document-processor';
import { GoogleTextProcessor } from './text-processor';
import { GooglePdfProcessor } from './pdf-processor';

/**
 * Factory for creating document processors based on file type
 */
export class GoogleProcessorFactory {
  /**
   * Create an appropriate document processor for the given file
   * @param driveClient The Google Drive client
   * @param file The file metadata from Google Drive
   * @returns An appropriate document processor
   */
  static createProcessor(
    driveClient: GoogleDriveClient,
    file: GoogleDriveFile
  ): GoogleDocumentProcessor {
    // Check the MIME type to determine the appropriate processor
    const mimeType = file.mimeType.toLowerCase();

    // Plain text files
    if (mimeType === 'text/plain') {
      return new GoogleTextProcessor(driveClient, file);
    }
    
    // PDF files
    if (mimeType === 'application/pdf') {
      return new GooglePdfProcessor(driveClient, file);
    }

    // Google Docs exported as PDF
    if (mimeType === 'application/vnd.google-apps.document') {
      return new GooglePdfProcessor(driveClient, file);
    }

    // Add more processors for other file types as needed
    
    // Fall back to text processor if no specific processor is available
    console.warn(`No specific processor for MIME type: ${mimeType}. Using text processor as fallback.`);
    return new GoogleTextProcessor(driveClient, file);
  }
}