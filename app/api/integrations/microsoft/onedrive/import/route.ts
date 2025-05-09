import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getMicrosoftIntegration } from '@/lib/integrations/microsoft/auth';
import { MicrosoftGraphClient } from '@/lib/integrations/microsoft/graph-client';
import { OneDriveClient } from '@/lib/integrations/microsoft/onedrive';
import { getProcessor } from '@/lib/integrations/microsoft/processors/processor-factory';

/**
 * POST: Import a file from OneDrive to the knowledge base
 * Request body should contain:
 * - fileId: string
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
    const { fileId, fileName, title, description } = await request.json();
    
    if (!fileId || !fileName) {
      return NextResponse.json({ 
        error: 'Missing required fields: fileId and fileName are required' 
      }, { status: 400 });
    }
    
    // Check if Microsoft integration exists for the user
    const integration = await getMicrosoftIntegration(session.user.id);
    
    if (!integration) {
      return NextResponse.json({ error: 'Microsoft account not connected' }, { status: 404 });
    }
    
    // Initialize the Graph client
    const graphClient = await new MicrosoftGraphClient(session.user.id).init();
    
    // Create OneDrive client
    const oneDriveClient = new OneDriveClient(graphClient);
    
    // Get file content
    const content = await oneDriveClient.getFileContent(fileId);
    
    // Get an appropriate processor for the file type
    const processor = getProcessor(session.user.id, fileName, {
      source: 'onedrive',
      fileId
    });
    
    // Process the file and add it to the knowledge base
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
    console.error('Failed to import file from OneDrive:', error);
    
    // Determine status code based on error type
    const status = error.message?.includes('not connected') ? 401 :
                   error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json({
      error: 'Failed to import file from OneDrive',
      message: error.message
    }, { status });
  }
}