import { DocumentProcessor } from './document-processor';

/**
 * Processor for plain text files
 */
export class TextProcessor extends DocumentProcessor {
  async extractText(content: ArrayBuffer): Promise<string> {
    try {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(content);
      
      // Check if we got a valid result
      if (!text || text.trim() === '') {
        console.warn('Empty or invalid text content');
        return "Empty document or unsupported format";
      }
      
      return text;
    } catch (error) {
      console.error('Error extracting text from plain text file:', error);
      
      // Return a placeholder text instead of throwing an error
      return "Failed to extract text from document. The document may be corrupted or in an unsupported format.";
    }
  }
}