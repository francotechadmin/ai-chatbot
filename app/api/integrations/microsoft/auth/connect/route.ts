import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getAuthUrl } from '@/lib/integrations/microsoft/auth';
import { v4 as uuidv4 } from 'uuid';
import { MicrosoftCredentials } from '@/lib/integrations/microsoft/config';

/**
 * GET: Generate authentication URL for Microsoft OAuth flow (deprecated)
 * This endpoint initiates the OAuth flow by redirecting to Microsoft's login page
 */
export async function GET() {
  // For backward compatibility - redirect to POST method
  return NextResponse.json({ error: 'Please use POST method with optional credentials' }, { status: 400 });
}

/**
 * POST: Generate authentication URL for Microsoft OAuth flow
 * This endpoint initiates the OAuth flow by redirecting to Microsoft's login page
 * Optionally accepts user-provided credentials
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Parse request body for credentials
    const body = await request.json().catch(() => ({}));
    const credentials: MicrosoftCredentials | undefined = body.credentials;
    
    // Validate credentials if provided
    if (credentials) {
      if (!credentials.clientId || !credentials.clientSecret) {
        return NextResponse.json({ 
          error: 'When providing custom credentials, both clientId and clientSecret are required' 
        }, { status: 400 });
      }
    }
    
    // Generate state parameter for OAuth flow
    const state = uuidv4();
    
    // Generate auth URL with optional user-provided credentials
    const authUrl = getAuthUrl(state, credentials);
    
    // Create response with auth URL
    const response = NextResponse.json({ url: authUrl });
    
    // Store credentials in a cookie if provided (encrypted for security)
    if (credentials) {
      // Encode as base64 for simplicity - in production consider encryption
      const credentialsStr = Buffer.from(JSON.stringify(credentials)).toString('base64');
      
      // Set cookie with credentials that expires in 10 minutes
      response.cookies.set('ms_credentials', credentialsStr, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60, // 10 minutes
      });
    }
    
    return response;
  } catch (error) {
    console.error('Failed to generate Microsoft auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate authentication URL' }, { status: 500 });
  }
}