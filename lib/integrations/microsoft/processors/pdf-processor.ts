import { DocumentProcessor } from './document-processor';

/**
 * Processor for PDF documents
 * Uses pdf-parse for PDF processing
 */
export class PdfProcessor extends DocumentProcessor {
  async extractText(content: ArrayBuffer): Promise<string> {
    try {
      // We need to dynamically import pdf-parse to avoid server/client mismatch issues
      const pdfParse = await import('pdf-parse');
      
      // Convert ArrayBuffer to Buffer for pdf-parse
      const buffer = Buffer.from(content);
      
      // Extract text from PDF
      const data = await pdfParse.default(buffer);
      
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to process PDF document');
    }
  }
}