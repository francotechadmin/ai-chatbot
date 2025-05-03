import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleAuth } from '@/lib/integrations/google/auth';
import { GoogleCredentials } from '@/lib/integrations/google/config';
import { auth } from '@/app/(auth)/auth';

/**
 * Handles the OAuth callback from Google
 */
export async function GET(req: NextRequest) {
  try {
    // Get the current authenticated user
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.redirect(new URL('/error?message=User not authenticated', req.url));
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const encodedState = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for errors in the OAuth response
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/error?message=Authentication failed', req.url));
    }

    // Ensure we have the authorization code
    if (!code || !encodedState) {
      return NextResponse.redirect(new URL('/error?message=Missing authorization code or state', req.url));
    }

    // Decode and parse the state
    let stateData;
    let credentials: GoogleCredentials | undefined;
    
    try {
      const decodedState = Buffer.from(encodedState, 'base64').toString();
      stateData = JSON.parse(decodedState);
      
      // Extract credentials if they were included
      if (stateData.credentials) {
        credentials = stateData.credentials;
      }
    } catch (error) {
      console.error('Error parsing state:', error);
      return NextResponse.redirect(new URL('/error?message=Invalid state format', req.url));
    }

    // Validate the state from the cookie
    const cookieStore = await cookies();
    const storedState = cookieStore.get('google_oauth_state')?.value;
    
    console.log('Stored state:', storedState);
    console.log('Received state:', stateData.state);
    
    if (!storedState || storedState !== stateData.state) {
      return NextResponse.redirect(new URL('/error?message=Invalid OAuth state', req.url));
    }

    // Exchange the code for tokens, using credentials if provided
    const tokens = await GoogleAuth.getTokensFromCode(code, credentials);
    
    // Get user info from Google
    const userInfo = await GoogleAuth.getUserInfo(tokens.access_token);

    // Save the integration to the database, including credentials if provided
    await GoogleAuth.saveCredentials(userId, tokens, userInfo, credentials);

    // Clear the state cookie
    cookieStore.set('google_oauth_state', '', { maxAge: 0 });

    // Redirect to the dashboard with a success message
    return NextResponse.redirect(new URL('/integrations/google?status=success', req.url));
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent('Failed to complete authentication')}`, req.url));
  }
}