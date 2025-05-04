/**
 * Microsoft integration configuration
 * Uses environment variables for credentials
 */

export const DEFAULT_SCOPES = [
  'User.Read',
  'Files.Read.All',
  'Sites.Read.All',
  'offline_access'
];

/**
 * Creates a Microsoft configuration object from environment variables
 */
export function getMicrosoftConfig() {
  return {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    redirectUri: typeof window !== 'undefined'
      ? `${window.location.origin}/api/integrations/microsoft/auth/callback`
      : process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:3000/api/integrations/microsoft/auth/callback',
    scopes: DEFAULT_SCOPES
  };
}