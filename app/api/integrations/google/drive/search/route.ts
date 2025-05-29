import { type NextRequest, NextResponse } from 'next/server';
import { GoogleDriveClient } from '@/lib/integrations/google/drive';
import { db } from '@/lib/db';
import { googleIntegration } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';
import { refreshAccessToken } from '@/lib/integrations/google/auth';

/**
 * GET handler to search files in Google Drive
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Get the current user ID from the session
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Get the Google auth credentials for the user
    const userIntegration = await db.query.googleIntegration.findFirst({
      where: eq(googleIntegration.userId, userId),
    });

    if (!userIntegration) {
      return NextResponse.json({ error: 'Google Drive not connected' }, { status: 404 });
    }

    // Check if the access token is expired and refresh if necessary
    if (userIntegration.expiresAt && userIntegration.expiresAt < new Date() && userIntegration.refreshToken) {
      
      const newTokens = await refreshAccessToken(userIntegration.refreshToken);
      
      // Update the tokens in the database
      await db.update(googleIntegration)
        .set({
          accessToken: newTokens.access_token,
          expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
          updatedAt: new Date()
        })
        .where(eq(googleIntegration.id, userIntegration.id));
      
      // Use the new access token
      userIntegration.accessToken = newTokens.access_token;
    }

    // Initialize Google Drive client with the access token
    const driveClient = new GoogleDriveClient(userIntegration.accessToken);
    
    // Search for files
    const result = await driveClient.searchFiles(`name contains '${query}' and trashed=false`);

    return NextResponse.json({ files: result.files });
    
  } catch (error) {
    console.error('Error searching Google Drive files:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to search files';
    const errorStatus = error instanceof Error && 'status' in error ? (error as any).status : 500;
    
    return NextResponse.json(
      { error: errorMessage },
      { status: errorStatus }
    );
  }
}