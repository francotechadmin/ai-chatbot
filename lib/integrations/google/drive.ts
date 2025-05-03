import { GOOGLE_API_BASE_URL } from './config';

/**
 * Interface for Google Drive file metadata
 */
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

/**
 * Options for listing files
 */
export interface ListFilesOptions {
  q?: string;              // Query string for searching files
  fields?: string;         // Fields to include in the response
  pageSize?: number;       // Maximum number of files to return
  pageToken?: string;      // Token for getting the next page of results
  orderBy?: string;        // Sort order
  spaces?: string;         // Which spaces to search: 'drive', 'appDataFolder', etc.
  includeItemsFromAllDrives?: boolean; // Include items from all drives
  supportsAllDrives?: boolean;         // Support for all drives
}

/**
 * Client for interacting with Google Drive API
 */
export class GoogleDriveClient {
  private accessToken: string;
  private apiUrl: string;

  /**
   * Create a new Google Drive client
   * @param accessToken OAuth access token
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.apiUrl = GOOGLE_API_BASE_URL;
  }

  /**
   * Make a request to the Google Drive API
   * @param endpoint API endpoint path
   * @param options Request options
   * @returns Response from the API
   */
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive API error: ${error}`);
    }

    return await response.json();
  }

  /**
   * List files in Google Drive
   * @param options Options for listing files
   * @returns List of files
   */
  async listFiles(options: ListFilesOptions = {}): Promise<{ files: GoogleDriveFile[], nextPageToken?: string }> {
    const queryParams = new URLSearchParams();

    // Add options to query parameters
    if (options.q) queryParams.append('q', options.q);
    if (options.fields) queryParams.append('fields', options.fields);
    if (options.pageSize) queryParams.append('pageSize', options.pageSize.toString());
    if (options.pageToken) queryParams.append('pageToken', options.pageToken);
    if (options.orderBy) queryParams.append('orderBy', options.orderBy);
    if (options.spaces) queryParams.append('spaces', options.spaces);
    
    if (options.includeItemsFromAllDrives !== undefined) {
      queryParams.append('includeItemsFromAllDrives', options.includeItemsFromAllDrives.toString());
    }
    
    if (options.supportsAllDrives !== undefined) {
      queryParams.append('supportsAllDrives', options.supportsAllDrives.toString());
    }
    
    // Default fields if none provided
    if (!options.fields) {
      queryParams.append('fields', 'nextPageToken, files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, thumbnailLink, parents)');
    }
    
    const endpoint = `/files?${queryParams.toString()}`;
    return await this.request(endpoint);
  }

  /**
   * Get file metadata by ID
   * @param fileId ID of the file
   * @param fields Fields to include
   * @returns File metadata
   */
  async getFile(fileId: string, fields?: string): Promise<GoogleDriveFile> {
    const queryParams = new URLSearchParams();
    
    if (fields) {
      queryParams.append('fields', fields);
    } else {
      queryParams.append('fields', 'id, name, mimeType, createdTime, modifiedTime, size, webViewLink, thumbnailLink, parents');
    }
    
    const endpoint = `/files/${fileId}?${queryParams.toString()}`;
    return await this.request(endpoint);
  }

  /**
   * Get contents of a folder
   * @param folderId ID of the folder
   * @returns List of files in the folder
   */
  async getFolderContents(folderId: string): Promise<{ files: GoogleDriveFile[] }> {
    return await this.listFiles({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, thumbnailLink)'
    });
  }

  /**
   * Search for files by name
   * @param query Search query
   * @returns List of matching files
   */
  async searchFiles(query: string): Promise<{ files: GoogleDriveFile[] }> {
    return await this.listFiles({
      q: query,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, size, webViewLink, thumbnailLink)'
    });
  }

  /**
   * Download file content
   * @param fileId ID of the file
   * @returns File content as array buffer
   */
  async downloadFile(fileId: string): Promise<ArrayBuffer> {
    const endpoint = `/files/${fileId}?alt=media`;
    
    const url = `${this.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to download file: ${error}`);
    }
    
    return await response.arrayBuffer();
  }

  /**
   * Export Google Workspace document to requested format
   * @param fileId ID of the Google Workspace document
   * @param mimeType MIME type to export as
   * @returns Exported file content as array buffer
   */
  async exportFile(fileId: string, mimeType: string): Promise<ArrayBuffer> {
    const queryParams = new URLSearchParams({
      mimeType
    });
    
    const endpoint = `/files/${fileId}/export?${queryParams.toString()}`;
    
    const url = `${this.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to export file: ${error}`);
    }
    
    return await response.arrayBuffer();
  }
}