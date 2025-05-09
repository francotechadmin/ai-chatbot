import type { GoogleDriveClient, GoogleDriveFile } from '../drive';

/**
 * Base document processor for Google Drive files
 */
export abstract class GoogleDocumentProcessor {
  protected driveClient: GoogleDriveClient;
  protected file: GoogleDriveFile;
  
  constructor(driveClient: GoogleDriveClient, file: GoogleDriveFile) {
    this.driveClient = driveClient;
    this.file = file;
  }

  /**
   * Download the file content from Google Drive
   */
  protected async downloadContent(): Promise<ArrayBuffer> {
    return this.driveClient.downloadFile(this.file.id);
  }

  /**
   * Process the document and extract its text
   */
  abstract extractText(): Promise<string>;

  /**
   * Get metadata about the document
   */
  getMetadata() {
    return {
      name: this.file.name,
      mimeType: this.file.mimeType,
      createdTime: this.file.createdTime,
      modifiedTime: this.file.modifiedTime,
      size: this.file.size,
      webViewLink: this.file.webViewLink,
      id: this.file.id,
    };
  }
}