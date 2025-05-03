/**
 * Google Drive Integration Configuration
 */

// Interface for user-provided credentials
export interface GoogleCredentials {
  clientId: string;
  clientSecret: string;
}

// Default scopes required for Google Drive integration
export const DEFAULT_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly', // Read-only access to Drive files
  'https://www.googleapis.com/auth/userinfo.email', // Get user email
  'https://www.googleapis.com/auth/userinfo.profile', // Get basic profile info
    'https://www.googleapis.com/auth/drive.file', // Access files created or opened by the app
    'https://www.googleapis.com/auth/drive.metadata.readonly', // Read-only access to file metadata
    'https://www.googleapis.com/auth/drive.photos.readonly', // Read-only access to photos in Drive
    'https://www.googleapis.com/auth/drive.appdata', // Access to the app's data folder in Drive

];

// Google API endpoints
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_API_BASE_URL = 'https://www.googleapis.com/drive/v3';
export const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/**
 * Creates a Google configuration object from user provided credentials or environment variables
 */
export function getGoogleConfig(credentials?: GoogleCredentials) {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: typeof window !== 'undefined' 
      ? `${window.location.origin}/api/integrations/google/auth/callback`
      : process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google/auth/callback',
    scopes: DEFAULT_SCOPES
  };
}

/**
 * Helper function to construct the OAuth URL
 */
export function getGoogleAuthUrl(credentials?: GoogleCredentials, state?: string) {
  const config = getGoogleConfig(credentials);
  
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