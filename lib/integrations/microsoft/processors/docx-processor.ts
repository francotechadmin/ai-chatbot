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
      
      // Create a Buffer from the ArrayBuffer
      const buffer = Buffer.from(content);
      
      // Use the buffer directly instead of arrayBuffer option
      const result = await mammoth.extractRawText({ buffer });
      
      // Check if we got a valid result
      if (!result || !result.value) {
        console.warn('Empty or invalid result from mammoth.js');
        return "Empty document or unsupported format";
      }
      
      return result.value;
    } catch (error) {
      console.error('Error extracting text from DOCX:', error);
      
      // Return a placeholder text instead of throwing an error
      // This allows the document to be processed even if text extraction fails
      return "Failed to extract text from Word document. The document may be corrupted or in an unsupported format.";
    }
  }
}