import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { MicrosoftGraphClient } from '@/lib/integrations/microsoft/graph-client';
import { OneDriveClient } from '@/lib/integrations/microsoft/onedrive';

/**
 * GET: Search for files in OneDrive
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get search query from request
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }
  
  try {
    // Initialize Graph client
    const graphClient = await new MicrosoftGraphClient(session.user.id).init();
    
    // Create OneDrive client
    const oneDriveClient = new OneDriveClient(graphClient);
    
    // Search for files
    const results = await oneDriveClient.searchFiles(query);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching OneDrive files:', error);
    return NextResponse.json(
      { error: 'Failed to search OneDrive files' }, 
      { status: 500 }
    );
  }
}