import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getTokenFromCode, saveTokens } from '@/lib/integrations/microsoft/auth';
import { MicrosoftCredentials } from '@/lib/integrations/microsoft/config';

/**
 * GET: Handle OAuth callback from Microsoft
 * This endpoint receives the authorization code from Microsoft after user grants permissions
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (error) {
    return NextResponse.redirect(new URL(`/integrations/microsoft?error=${error}`, request.url));
  }
  
  if (!code) {
    return NextResponse.redirect(new URL('/integrations/microsoft?error=no_code', request.url));
  }
  
  try {
    // Check if there are user-provided credentials in the cookie
    let credentials: MicrosoftCredentials | undefined;
    const credentialsCookie = request.cookies.get('ms_credentials');
    
    if (credentialsCookie?.value) {
      try {
        // Decode the base64 encoded credentials
        const decodedCreds = Buffer.from(credentialsCookie.value, 'base64').toString();
        credentials = JSON.parse(decodedCreds);
      } catch (e) {
        console.error('Failed to parse credentials from cookie:', e);
        // Continue without credentials if parsing fails
      }
    }
    
    // Exchange code for token using credentials if available
    const tokenResponse = await getTokenFromCode(code, credentials);
    
    if (tokenResponse.error) {
      throw new Error(`Token error: ${tokenResponse.error_description}`);
    }
    
    // Save tokens and credentials to database
    await saveTokens(session.user.id, tokenResponse, credentials);
    
    // Create response to redirect back to integration page
    const response = NextResponse.redirect(new URL('/integrations/microsoft?success=true', request.url));
    
    // Clear the credentials cookie
    if (credentialsCookie) {
      response.cookies.delete('ms_credentials');
    }
    
    return response;
    
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error);
    return NextResponse.redirect(new URL('/integrations/microsoft?error=token_exchange_failed', request.url));
  }
}