import { MicrosoftGraphClient } from './graph-client';

/**
 * Client for interacting with OneDrive via Microsoft Graph API
 */
export class OneDriveClient {
  private graphClient: MicrosoftGraphClient;

  constructor(graphClient: MicrosoftGraphClient) {
    this.graphClient = graphClient;
  }

  /**
   * Get items from OneDrive root or specific path
   * @param path The path in OneDrive (default: root)
   * @returns Drive items at the specified path
   */
  async getDriveItems(path = '/') {
    const endpoint = path === '/' 
      ? '/me/drive/root/children' 
      : `/me/drive/root:${path}:/children`;
    
    const response = await this.graphClient.fetchFromGraph(endpoint);
    return response.value;
  }

  /**
   * Get a specific item by ID
   * @param itemId The item ID
   * @returns Item details
   */
  async getItem(itemId: string) {
    return this.graphClient.fetchFromGraph(`/me/drive/items/${itemId}`);
  }

  /**
   * Get an item by path
   * @param path The path to the item
   * @returns Item details
   */
  async getItemByPath(path: string) {
    return this.graphClient.fetchFromGraph(`/me/drive/root:${path}`);
  }

  /**
   * Get children of a folder
   * @param folderId The folder ID
   * @returns Children items in the folder
   */
  async getFolderChildren(folderId: string) {
    const response = await this.graphClient.fetchFromGraph(`/me/drive/items/${folderId}/children`);
    return response.value;
  }

  /**
   * Get the content of a file
   * @param itemId The file ID
   * @returns File content as ArrayBuffer
   */
  async getFileContent(itemId: string) {
    // Get the item to find its download URL
    const item = await this.getItem(itemId);
    
    // Get the download URL
    const downloadUrl = item['@microsoft.graph.downloadUrl'];
    
    if (!downloadUrl) {
      throw new Error(`No download URL available for file ${itemId}`);
    }
    
    // Download the content
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  }

  /**
   * Search for files in OneDrive
   * @param query The search query
   * @returns Search results
   */
  async searchFiles(query: string) {
    const response = await this.graphClient.fetchFromGraph(`/me/drive/root/search(q='${encodeURIComponent(query)}')`);
    return response.value;
  }

  /**
   * Get recent files
   * @returns Recent files
   */
  async getRecentFiles() {
    const response = await this.graphClient.fetchFromGraph('/me/drive/recent');
    return response.value;
  }

  /**
   * Get shared files
   * @returns Files shared with the user
   */
  async getSharedFiles() {
    const response = await this.graphClient.fetchFromGraph('/me/drive/sharedWithMe');
    return response.value;
  }
}