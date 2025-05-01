/**
 * Microsoft integration configuration
 * This allows for using user-provided credentials instead of environment variables
 */
export interface MicrosoftCredentials {
  clientId: string;
  clientSecret: string;
}

export const DEFAULT_SCOPES = [
  'User.Read',
  'Files.Read.All',
  'Sites.Read.All',
  'offline_access'
];

/**
 * Creates a Microsoft configuration object from user provided credentials
 * Falls back to environment variables if no credentials are provided
 */
export function getMicrosoftConfig(credentials: MicrosoftCredentials) {
  return {
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
    redirectUri: `${window.location.origin}/api/integrations/microsoft/auth/callback`,
    scopes: DEFAULT_SCOPES
  };
}