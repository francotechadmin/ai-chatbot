import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { MicrosoftGraphClient } from '@/lib/integrations/microsoft/graph-client';
import { SharePointClient } from '@/lib/integrations/microsoft/sharepoint';

/**
 * GET: Get documents from a SharePoint document library
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get parameters from the query string
  const searchParams = request.nextUrl.searchParams;
  const siteId = searchParams.get('siteId');
  const listId = searchParams.get('listId');
  const folderId = searchParams.get('folderId');
  
  if (!siteId || !listId) {
    return NextResponse.json({ error: 'Site ID and List ID are required' }, { status: 400 });
  }
  
  try {
    // Initialize the Graph client
    const graphClient = await new MicrosoftGraphClient(session.user.id).init();
    
    // Initialize the SharePoint client
    const sharepointClient = new SharePointClient(graphClient);
    
    let documents;
    
    // If a folder ID is provided, get documents from that folder
    if (folderId) {
      documents = await sharepointClient.getFolderDocuments(siteId, listId, folderId);
    } else {
      // Otherwise get documents from the root of the library
      documents = await sharepointClient.getDocuments(siteId, listId);
    }
    
    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Failed to fetch SharePoint documents:', error);
    
    if (error.message?.includes('Microsoft integration not found')) {
      return NextResponse.json({ error: 'Microsoft integration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch SharePoint documents' }, { status: 500 });
  }
}