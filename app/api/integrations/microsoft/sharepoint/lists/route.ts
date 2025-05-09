import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { MicrosoftGraphClient } from '@/lib/integrations/microsoft/graph-client';
import { SharePointClient } from '@/lib/integrations/microsoft/sharepoint';

/**
 * GET: Get lists (document libraries) from a SharePoint site
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get the site ID from the query string
  const searchParams = request.nextUrl.searchParams;
  const siteId = searchParams.get('siteId');
  
  if (!siteId) {
    return NextResponse.json({ error: 'Site ID is required' }, { status: 400 });
  }
  
  try {
    // Initialize the Graph client
    const graphClient = await new MicrosoftGraphClient(session.user.id).init();
    
    // Initialize the SharePoint client
    const sharepointClient = new SharePointClient(graphClient);
    
    // Get the document libraries
    const lists = await sharepointClient.getLists(siteId);
    
    // Filter for document libraries (which have a drive property)
    const documentLibraries = lists.filter(list => list.drive);
    
    return NextResponse.json({ lists: documentLibraries });
  } catch (error: any) {
    console.error('Failed to fetch SharePoint lists:', error);
    
    if (error.message?.includes('Microsoft integration not found')) {
      return NextResponse.json({ error: 'Microsoft integration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to fetch SharePoint lists' }, { status: 500 });
  }
}