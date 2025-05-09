import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { MicrosoftGraphClient } from '@/lib/integrations/microsoft/graph-client';
import { SharePointClient } from '@/lib/integrations/microsoft/sharepoint';
import { OneDriveClient } from '@/lib/integrations/microsoft/onedrive';
import { getProcessor } from '@/lib/integrations/microsoft/processors/processor-factory';

/**
 * POST: Import document from SharePoint or OneDrive to knowledge base
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    const {
      source,     // 'sharepoint' or 'onedrive'
      fileName,   // Name of the file
      description // Optional description
    } = body;
    
    if (!source || !fileName) {
      return NextResponse.json({ error: 'source and fileName are required' }, { status: 400 });
    }
    
    // Initialize the Graph client
    const graphClient = await new MicrosoftGraphClient(session.user.id).init();
    
    let content: ArrayBuffer;
    
    // Get content from the appropriate source
    if (source === 'sharepoint') {
      const { siteId, driveId, itemId } = body;
      
      if (!siteId || !driveId || !itemId) {
        return NextResponse.json({ error: 'siteId, driveId, and itemId are required for SharePoint documents' }, { status: 400 });
      }
      
      const sharepointClient = new SharePointClient(graphClient);
      content = await sharepointClient.getDocumentContent(siteId, driveId, itemId);
    } else if (source === 'onedrive') {
      const { itemId } = body;
      
      if (!itemId) {
        return NextResponse.json({ error: 'itemId is required for OneDrive files' }, { status: 400 });
      }
      
      const oneDriveClient = new OneDriveClient(graphClient);
      content = await oneDriveClient.getFileContent(itemId);
    } else {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }
    
    if (!content) {
      return NextResponse.json({ error: 'Failed to fetch document content' }, { status: 500 });
    }
    
    // Create metadata object
    const metadata = {
      source,
      originalFilename: fileName,
      importedBy: session.user.id,
      importedAt: new Date().toISOString(),
      ...body
    };
    
    // Get the appropriate document processor
    const processor = getProcessor(session.user.id, fileName, metadata);
    
    // Process the document and add to knowledge base
    const knowledgeSource = await processor.processDocument(content, fileName, description);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Document imported successfully',
      knowledgeSource
    });
  } catch (error: any) {
    console.error('Failed to import document:', error);
    
    if (error.message?.includes('Microsoft integration not found')) {
      return NextResponse.json({ error: 'Microsoft integration not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: `Failed to import document: ${error.message}` }, { status: 500 });
  }
}