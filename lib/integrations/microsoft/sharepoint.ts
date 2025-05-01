import { MicrosoftGraphClient } from './graph-client';

/**
 * Client for interacting with SharePoint via Microsoft Graph API
 */
export class SharePointClient {
  private graphClient: MicrosoftGraphClient;

  constructor(graphClient: MicrosoftGraphClient) {
    this.graphClient = graphClient;
  }

  /**
   * Get all SharePoint sites the user has access to
   * @returns List of SharePoint sites
   */
  async getSites() {
    const response = await this.graphClient.fetchFromGraph('/sites?search=*');
    return response.value;
  }

  /**
   * Get a specific SharePoint site by ID
   * @param siteId The site ID
   * @returns SharePoint site details
   */
  async getSite(siteId: string) {
    return this.graphClient.fetchFromGraph(`/sites/${siteId}`);
  }

  /**
   * Get lists (document libraries and lists) for a site
   * @param siteId The site ID
   * @returns Lists in the site
   */
  async getLists(siteId: string) {
    const response = await this.graphClient.fetchFromGraph(`/sites/${siteId}/lists`);
    return response.value;
  }

  /**
   * Get list items for a specific list
   * @param siteId The site ID
   * @param listId The list ID
   * @returns Items in the list
   */
  async getListItems(siteId: string, listId: string) {
    const response = await this.graphClient.fetchFromGraph(`/sites/${siteId}/lists/${listId}/items?expand=fields`);
    return response.value;
  }

  /**
   * Get documents from a document library
   * @param siteId The site ID
   * @param listId The document library ID
   * @returns Documents in the library
   */
  async getDocuments(siteId: string, listId: string) {
    const response = await this.graphClient.fetchFromGraph(`/sites/${siteId}/lists/${listId}/drive/root/children`);
    return response.value;
  }

  /**
   * Get documents from a folder in a document library
   * @param siteId The site ID
   * @param listId The document library ID
   * @param folderId The folder ID
   * @returns Documents in the folder
   */
  async getFolderDocuments(siteId: string, listId: string, folderId: string) {
    const response = await this.graphClient.fetchFromGraph(`/sites/${siteId}/lists/${listId}/drive/items/${folderId}/children`);
    return response.value;
  }

  /**
   * Get the content of a document
   * @param siteId The site ID
   * @param driveId The drive ID
   * @param itemId The item ID
   * @returns Document content as an ArrayBuffer
   */
  async getDocumentContent(siteId: string, driveId: string, itemId: string) {
    // Get the item to find its download URL
    const item = await this.graphClient.fetchFromGraph(`/sites/${siteId}/drives/${driveId}/items/${itemId}`);
    
    // Get the download URL
    const downloadUrl = item['@microsoft.graph.downloadUrl'];
    
    if (!downloadUrl) {
      throw new Error(`No download URL available for document ${itemId}`);
    }
    
    // Download the content
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.status} ${response.statusText}`);
    }
    
    return await response.arrayBuffer();
  }

  /**
   * Search for content across all SharePoint sites
   * @param query The search query
   * @returns Search results
   */
  async searchContent(query: string) {
    const response = await this.graphClient.fetchFromGraph(`/search/query`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          entityTypes: ["driveItem"],
          query: {
            queryString: query
          }
        }]
      })
    });
    
    return response.value[0].hitsContainers[0].hits;
  }
}