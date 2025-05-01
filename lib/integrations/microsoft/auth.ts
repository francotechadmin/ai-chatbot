import { getMicrosoftConfig, MicrosoftCredentials } from './config';
import { db } from '@/lib/db/index';
import { microsoftIntegration } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Generates the authorization URL for Microsoft OAuth
 * @param state A random state value for CSRF protection
 * @param credentials Optional user-provided Microsoft credentials
 * @returns The authorization URL
 */
export function getAuthUrl(state: string, credentials: MicrosoftCredentials) {
  const config = getMicrosoftConfig(credentials);
  const scopes = encodeURIComponent(config.scopes.join(' '));
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${config.clientId}&response_type=code&redirect_uri=${encodeURIComponent(config.redirectUri)}&scope=${scopes}&state=${state}&response_mode=query`;
}

/**
 * Exchange an authorization code for an access token
 * @param code The authorization code from the OAuth callback
 * @param credentials Optional user-provided Microsoft credentials
 * @returns The token response
 */
export async function getTokenFromCode(code: string, credentials: MicrosoftCredentials) {
  const config = getMicrosoftConfig(credentials);
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code: code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  return await response.json();
}

/**
 * Refresh an access token using a refresh token
 * @param refreshToken The refresh token
 * @param credentials Optional user-provided Microsoft credentials
 * @returns The token response
 */
export async function refreshToken(refreshToken: string, credentials: MicrosoftCredentials) {
  const config = getMicrosoftConfig(credentials);
  const tokenEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  
  return await response.json();
}

/**
 * Save the Microsoft token response to the database
 * @param userId The user ID
 * @param tokenResponse The token response from the OAuth process
 * @param credentials Optional user-provided credentials to store alongside the tokens
 */
export async function saveTokens(userId: string, tokenResponse: any, credentials?: MicrosoftCredentials) {
  const now = new Date();
  const expiresIn = tokenResponse.expires_in || 3600;
  const expiresAt = new Date(now.getTime() + expiresIn * 1000);
  
  try {
    // Check if user already has an integration
    const existing = await db
      .select()
      .from(microsoftIntegration)
      .where(eq(microsoftIntegration.userId, userId));
    
    // Store credentials if provided
    const clientId = credentials?.clientId;
    const clientSecret = credentials?.clientSecret;
    
    if (existing.length > 0) {
      // Update existing integration
      await db.update(microsoftIntegration)
        .set({
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenType: tokenResponse.token_type,
          scope: tokenResponse.scope,
          expiresAt: expiresAt,
          updatedAt: now,
          ...(clientId && { clientId }),
          ...(clientSecret && { clientSecret }),
        })
        .where(eq(microsoftIntegration.userId, userId));
    } else {
      // Create new integration
      await db.insert(microsoftIntegration).values({
        userId: userId,
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenType: tokenResponse.token_type,
        scope: tokenResponse.scope,
        expiresAt: expiresAt,
        createdAt: now,
        updatedAt: now,
        ...(clientId && { clientId }),
        ...(clientSecret && { clientSecret }),
      });
    }
  } catch (error) {
    console.error('Failed to save Microsoft tokens:', error);
    throw new Error('Failed to save integration credentials');
  }
}

/**
 * Get Microsoft integration for a user
 * @param userId The user ID
 * @returns The integration or null if not found
 */
export async function getMicrosoftIntegration(userId: string) {
  try {
    const [integration] = await db
      .select()
      .from(microsoftIntegration)
      .where(eq(microsoftIntegration.userId, userId));
    
    return integration || null;
  } catch (error) {
    console.error('Failed to get Microsoft integration:', error);
    return null;
  }
}

/**
 * Delete Microsoft integration for a user
 * @param userId The user ID
 */
export async function deleteMicrosoftIntegration(userId: string) {
  try {
    await db
      .delete(microsoftIntegration)
      .where(eq(microsoftIntegration.userId, userId));
  } catch (error) {
    console.error('Failed to delete Microsoft integration:', error);
    throw new Error('Failed to delete integration');
  }
}