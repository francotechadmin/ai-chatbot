import { type NextRequest, NextResponse } from 'next/server';
import { getIntegration, revokeToken, deleteIntegration } from '@/lib/integrations/google/auth';
import { auth } from '@/app/(auth)/auth';

/**
 * Handles disconnecting from Google Drive
 */
export async function POST(req: NextRequest) {
  try {
    // Get the current authenticated user
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the stored credentials for this user
    const integration = await getIntegration(userId);

    if (!integration) {
      return NextResponse.json({ error: 'No Google integration found' }, { status: 404 });
    }

    // Attempt to revoke the tokens if they exist
    if (integration.accessToken) {
      try {
        await revokeToken(integration.accessToken);
      } catch (e) {
        console.error('Failed to revoke access token:', e);
        // Continue with deletion even if revocation fails
      }
    }

    if (integration.refreshToken) {
      try {
        await revokeToken(integration.refreshToken);
      } catch (e) {
        console.error('Failed to revoke refresh token:', e);
      }
    }

    // Delete the integration from the database
    await deleteIntegration(userId);

    // Optionally, clear any cookies or session data related to Google integration
    await req.cookies.delete('google_oauth_state');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google integration:', error);
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 });
  }
}