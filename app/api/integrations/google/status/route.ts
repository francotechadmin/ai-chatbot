import { type NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from '@/lib/integrations/google/auth';
import { auth } from '@/app/(auth)/auth';

/**
 * GET handler to check if Google Drive is connected
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current authenticated user
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ connected: false, error: 'User not authenticated' }, { status: 401 });
    }

    // Get the Google auth credentials for the user
    const integration = await GoogleAuth.getIntegration(userId);

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    // Check if the token is valid
    let isValid = false;

    try {
      isValid = await GoogleAuth.validateToken(integration.accessToken);

      // If the token is expired but we have a refresh token, attempt to refresh it
      if (!isValid && integration.refreshToken) {
        const newTokens = await GoogleAuth.refreshAccessToken(integration.refreshToken);
        
        // Get user info to validate the new token
        const userInfo = await GoogleAuth.getUserInfo(newTokens.access_token);

        // Update the database with new tokens
        await GoogleAuth.saveCredentials(
          userId,
          newTokens,
          userInfo
        );
        
        isValid = true;
      }
    } catch (error) {
      console.error('Error validating Google token:', error);
      isValid = false;
    }

    // Return the connection status and user info
    return NextResponse.json({
      connected: isValid,
      user: isValid ? {
        id: integration.providerUserId,
        name: integration.providerUserName,
        email: integration.providerUserEmail,
      } : null,
    });
  } catch (error: any) {
    console.error('Error checking Google integration status:', error);
    return NextResponse.json(
      { connected: false, error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}