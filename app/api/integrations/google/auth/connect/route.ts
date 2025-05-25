import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthorizationUrl } from '@/lib/integrations/google/auth';
import { auth } from '@/app/(auth)/auth';

/**
 * Redirects the user to Google's OAuth consent page
 */
export async function GET(req: NextRequest) {
  return handleConnect(req);
}

/**
 * Handle POST request for connecting with custom credentials
 */
export async function POST(req: NextRequest) {
  return handleConnect(req, true);
}

/**
 * Common handler for both GET and POST requests
 */
async function handleConnect(req: NextRequest, isPost = false) {
  try {
    // Get the session user (required for authentication)
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Generate a random state to verify the OAuth callback
    const state = crypto.randomUUID();

    // Store the state in a cookie for validation during the callback
    const stateOptions = {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 15, // 15 minutes
    };

    const encodedState = Buffer.from(JSON.stringify({ state })).toString('base64');

    // Get the OAuth URL from Google
    const authUrl = getAuthorizationUrl(encodedState);

    // Create a response with the state cookie and redirect
    const response = isPost
      ? NextResponse.json({ url: authUrl })
      : NextResponse.redirect(authUrl);

    // Set the cookie using the cookies() API to be consistent with the callback handler
    const cookieStore = await cookies();
    cookieStore.set('google_oauth_state', state, stateOptions);

    console.log('Setting google_oauth_state cookie:', state);

    // check if cookie was set correctly
    const storedState = cookieStore.get('google_oauth_state')?.value;
    console.log('Stored state in cookie:', storedState);

    if (storedState !== state) {
      console.error('State cookie was not set correctly');
      return NextResponse.json({ error: 'Failed to set state cookie' }, { status: 500 });
    }

    return response;
  } catch (error) {
    console.error('Error starting Google OAuth flow:', error);
    return NextResponse.json({ error: 'Failed to start authentication' }, { status: 500 });
  }
}