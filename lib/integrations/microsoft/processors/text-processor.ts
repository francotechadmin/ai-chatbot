import { DocumentProcessor } from './document-processor';

/**
 * Processor for plain text files
 */
export class TextProcessor extends DocumentProcessor {
  async extractText(content: ArrayBuffer): Promise<string> {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(content);
  }
}