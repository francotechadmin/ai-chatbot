import { refreshToken } from './auth';
import { db } from '@/lib/db/index';
import { microsoftIntegration } from '@/lib/db/schema';
import { eq, type SQL } from 'drizzle-orm';
import type { MicrosoftCredentials } from './config';

/**
 * Client for interacting with Microsoft Graph API
 */
export class MicrosoftGraphClient {
  private userId: string;
  private accessToken: string | SQL<unknown> | undefined = undefined;
  private tokenExpiresAt: Date | null = null;
  private refreshToken: string | SQL<unknown> | undefined = undefined;
  private credentials: MicrosoftCredentials | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Initialize the client by loading credentials from database
   */
  async init() {
    // Get the tokens from the database
    const [integration] = await db
      .select()
      .from(microsoftIntegration)
      .where(eq(microsoftIntegration.userId, this.userId));

    if (!integration) {
      throw new Error('Microsoft integration not found');
    }

    this.accessToken = integration.accessToken;
    this.tokenExpiresAt = integration.expiresAt;
    this.refreshToken = integration.refreshToken;
    
    // Load user-provided credentials if available
    if (integration.clientId && integration.clientSecret) {
      this.credentials = {
        clientId: integration.clientId,
        clientSecret: integration.clientSecret
      };
    }

    // Check if the token is expired and refresh if needed
    if (this.isTokenExpired() && this.refreshToken) {
      await this.refreshAccessToken();
    }

    return this;
  }

  /**
   * Check if the access token is expired
   */
  private isTokenExpired() {
    if (!this.tokenExpiresAt) return true;
    // Add a 5-minute buffer to ensure we refresh before expiration
    return this.tokenExpiresAt.getTime() - 5 * 60 * 1000 < Date.now();
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken() {
    if (!this.refreshToken) throw new Error('No refresh token available');

    try {
      // Use user-provided credentials if available
      const tokenResponse = await refreshToken(this.refreshToken as string)
      
      if (tokenResponse.error) {
        throw new Error(`Token refresh error: ${tokenResponse.error_description}`);
      }

      this.accessToken = tokenResponse.access_token;
      this.refreshToken = tokenResponse.refresh_token || this.refreshToken;
      
      // Update token expiration time
      const expiresIn = tokenResponse.expires_in || 3600;
      this.tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

      // Update tokens in the database
      await db.update(microsoftIntegration)
        .set({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          expiresAt: this.tokenExpiresAt,
          updatedAt: new Date()
        })
        .where(eq(microsoftIntegration.userId, this.userId));

    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Make a request to the Microsoft Graph API
   * @param endpoint The API endpoint
   * @param options Request options
   * @returns The API response
   */
  async fetchFromGraph(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) throw new Error('No access token available');
    
    if (this.isTokenExpired() && this.refreshToken) {
      await this.refreshAccessToken();
    }

    const url = endpoint.startsWith('https://') 
      ? endpoint 
      : `https://graph.microsoft.com/v1.0${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      try {
        const error = await response.json();
        throw new Error(`Microsoft Graph API error: ${JSON.stringify(error)}`);
      } catch (e) {
        throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText}`);
      }
    }

    return await response.json();
  }
}