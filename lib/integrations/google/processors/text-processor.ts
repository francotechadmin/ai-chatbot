import { GoogleDocumentProcessor } from './document-processor';

/**
 * Processor for plain text files from Google Drive
 */
export class GoogleTextProcessor extends GoogleDocumentProcessor {
  /**
   * Extract text from a plain text file
   */
  async extractText(): Promise<string> {
    // Download the content of the text file
    const contentBuffer = await this.downloadContent();
    
    // Convert the ArrayBuffer to a string
    const textDecoder = new TextDecoder('utf-8');
    return textDecoder.decode(contentBuffer);
  }
}