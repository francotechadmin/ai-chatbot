import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { MicrosoftGraphClient } from '@/lib/integrations/microsoft/graph-client';
import { OneDriveClient } from '@/lib/integrations/microsoft/onedrive';

/**
 * GET: Get files from OneDrive
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get parameters from the query string
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path') || '/';
  const folderId = searchParams.get('folderId');
  
  try {
    // Initialize the Graph client
    const graphClient = await new MicrosoftGraphClient(session.user.id).init();
    
    // Initialize the OneDrive client
    const oneDriveClient = new OneDriveClient(graphClient);
    
    let files;
    
    // If a folder ID is provided, get files from that folder
    if (folderId) {
      files = await oneDriveClient.getFolderChildren(folderId);
    } else {
      // Otherwise get files from the specified path
      files = await oneDriveClient.getDriveItems(path);
    }
    
    return NextResponse.json({ files });
  } catch (error: any) {
    console.error('Failed to fetch OneDrive files:', error);
    
    if (error.message?.includes('Microsoft integration not found')) {
      return NextResponse.json({ error: 'Microsoft integration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch OneDrive files' }, { status: 500 });
  }
}