import { GoogleDocumentProcessor } from './document-processor';
import pdfParse from 'pdf-parse';

/**
 * Processor for PDF files from Google Drive
 */
export class GooglePdfProcessor extends GoogleDocumentProcessor {
  /**
   * Extract text from a PDF file
   */
  async extractText(): Promise<string> {
    try {
      // Download the PDF content
      const contentBuffer = await this.downloadContent();
      
      // Use pdf-parse to extract text from the PDF
      const pdfData = await pdfParse(Buffer.from(contentBuffer));
      
      return pdfData.text.trim();
    } catch (error: unknown) {
      console.error('Error extracting text from PDF:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
    }
  }
}