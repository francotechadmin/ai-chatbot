import { DocumentProcessor } from './document-processor';

/**
 * Processor for Microsoft Word documents (.docx)
 * Uses mammoth.js for DOCX processing
 */
export class DocxProcessor extends DocumentProcessor {
  async extractText(content: ArrayBuffer): Promise<string> {
    try {
      // We need to dynamically import mammoth to avoid server/client mismatch issues
      const mammoth = await import('mammoth');
      
      const result = await mammoth.extractRawText({ 
        arrayBuffer: content 
      });
      
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      throw new Error('Failed to process Word document');
    }
  }
}