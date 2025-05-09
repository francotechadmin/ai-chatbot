import {
  getGoogleConfig,
  GOOGLE_TOKEN_URL,
  GOOGLE_USER_INFO_URL,
  GOOGLE_AUTH_URL
} from './config';
import { db } from '@/lib/db';
import { googleIntegration } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Google OAuth token response structure
 */
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

/**
 * User information from Google
 */
export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Google OAuth authentication functions
 */

/**
 * Generate the OAuth authorization URL for Google
 * @returns The URL to redirect users to for authentication
 */
export function getAuthorizationUrl(state?: string): string {
    const config = getGoogleConfig();
    
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: config.scopes.join(' '),
    });

    if (state) {
      params.append('state', state);
    }

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  }

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string): Promise<GoogleTokens> {
    const config = getGoogleConfig();
    
    const params = new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for tokens: ${error}`);
    }

    return await response.json();
  }

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    const config = getGoogleConfig();
    
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return await response.json();
  }

/**
 * Get user information from Google
 */
export async function getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    return await response.json();
  }

/**
 * Validate access token
 */
export async function validateToken(accessToken: string): Promise<boolean> {
  try {
    await getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

/**
 * Revoke the given token
 * @param token Either an access token or a refresh token
 */
export async function revokeToken(token: string): Promise<void> {
    const params = new URLSearchParams({
      token,
    });

    const response = await fetch(`https://oauth2.googleapis.com/revoke?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to revoke token: ${response.statusText}`);
    }
  }

/**
 * Save Google credentials to the database
 */
export async function saveCredentials(userId: string, tokens: GoogleTokens, userInfo: GoogleUserInfo) {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + tokens.expires_in * 1000);
      
      // Check if integration exists
      const existing = await db.query.googleIntegration.findFirst({
        where: eq(googleIntegration.userId, userId),
      });

      if (existing) {
        // Update existing integration
        await db.update(googleIntegration)
          .set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || existing.refreshToken,
            tokenType: tokens.token_type,
            scope: tokens.scope,
            expiresAt,
            updatedAt: now,
            providerUserId: userInfo.id,
            providerUserEmail: userInfo.email,
            providerUserName: userInfo.name,
          })
          .where(eq(googleIntegration.userId, userId));
      } else {
        // Create new integration
        await db.insert(googleIntegration).values({
          userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: tokens.token_type,
          scope: tokens.scope,
          expiresAt,
          createdAt: now,
          updatedAt: now,
          providerUserId: userInfo.id,
          providerUserEmail: userInfo.email,
          providerUserName: userInfo.name,
        });
      }
    } catch (error) {
      console.error('Error saving Google credentials:', error);
      throw new Error('Failed to save Google credentials.');
    }
  }

/**
 * Get Google integration for a user
 */
export async function getIntegration(userId: string) {
    try {
      return await db.query.googleIntegration.findFirst({
        where: eq(googleIntegration.userId, userId),
      });
    } catch (error) {
      console.error('Error getting Google integration:', error);
      return null;
    }
  }

/**
 * Delete Google integration for a user
 */
export async function deleteIntegration(userId: string) {
    try {
      await db.delete(googleIntegration)
        .where(eq(googleIntegration.userId, userId));
    } catch (error) {
      console.error('Error deleting Google integration:', error);
      throw new Error('Failed to delete Google integration.');
    }
}