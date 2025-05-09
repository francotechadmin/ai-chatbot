import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getTokenFromCode, saveTokens } from '@/lib/integrations/microsoft/auth';

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
    // Exchange code for token using environment variables
    const tokenResponse = await getTokenFromCode(code);

    if (tokenResponse.error) {
      throw new Error(`Token error: ${tokenResponse.error_description}`);
    }

    // Save tokens to database
    await saveTokens(session.user.id, tokenResponse);

    // Redirect back to integration page
    return NextResponse.redirect(new URL('/integrations/microsoft?success=true', request.url));
    
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error);
    return NextResponse.redirect(new URL('/integrations/microsoft?error=token_exchange_failed', request.url));
  }
}