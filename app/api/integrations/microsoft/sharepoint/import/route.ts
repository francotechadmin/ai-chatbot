import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getMicrosoftIntegration } from '@/lib/integrations/microsoft/auth';
import { MicrosoftGraphClient } from '@/lib/integrations/microsoft/graph-client';
import { SharePointClient } from '@/lib/integrations/microsoft/sharepoint';
import { getProcessor } from '@/lib/integrations/microsoft/processors/processor-factory';

/**
 * POST: Import a document from SharePoint to the knowledge base
 * Request body should contain:
 * - siteId: string
 * - driveId: string
 * - itemId: string
 * - fileName: string
 * - title: string (optional, uses fileName if not provided)
 * - description: string (optional)
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { siteId, driveId, itemId, fileName, title, description } = await request.json();
    
    if (!siteId || !driveId || !itemId || !fileName) {
      return NextResponse.json({ 
        error: 'Missing required fields: siteId, driveId, itemId, and fileName are required' 
      }, { status: 400 });
    }
    
    // Check if Microsoft integration exists for the user
    const integration = await getMicrosoftIntegration(session.user.id);
    
    if (!integration) {
      return NextResponse.json({ error: 'Microsoft account not connected' }, { status: 404 });
    }
    
    // Initialize the Graph client
    const graphClient = await new MicrosoftGraphClient(session.user.id).init();
    
    // Create SharePoint client
    const sharePointClient = new SharePointClient(graphClient);
    
    // Get document content
    const content = await sharePointClient.getDocumentContent(siteId, driveId, itemId);
    
    // Get an appropriate processor for the file type
    const processor = getProcessor(session.user.id, fileName, {
      source: 'sharepoint',
      siteId,
      driveId,
      itemId
    });
    
    // Process the document and add it to the knowledge base
    const knowledgeSource = await processor.processDocument(
      content, 
      title || fileName, 
      description
    );
    
    return NextResponse.json({ 
      success: true, 
      knowledgeSourceId: knowledgeSource.id 
    });
    
  } catch (error: any) {
    console.error('Failed to import document from SharePoint:', error);
    
    // Determine status code based on error type
    const status = error.message?.includes('not connected') ? 401 :
                  error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json({
      error: 'Failed to import document from SharePoint',
      message: error.message
    }, { status });
  }
}