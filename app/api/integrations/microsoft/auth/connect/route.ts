import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getAuthUrl } from '@/lib/integrations/microsoft/auth';
import { v4 as uuidv4 } from 'uuid';

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
    // Generate state parameter for OAuth flow
    const state = uuidv4();

    // Generate auth URL using environment variables
    const authUrl = getAuthUrl(state);

    // Create response with auth URL
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to generate Microsoft auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate authentication URL' }, { status: 500 });
  }
}