import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getKnowledgeSourcesByStatus } from '@/lib/db/queries';

/**
 * This API route serves as a bridge between the Google Drive integration
 * and the knowledge base API. It returns knowledge base data in the format
 * expected by the Google Drive integration.
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch approved knowledge sources
    const approvedSources = await getKnowledgeSourcesByStatus('approved');

    // Format the response to match what the Google Drive integration expects
    // The Google Drive integration expects a response with a knowledgeBases array
    const response = {
      knowledgeBases: [
        {
          id: 'default', // Using 'default' as the ID since there's only one knowledge base
          name: 'Default Knowledge Base',
          sources: approvedSources.length,
          // You can add more knowledge base properties here if needed
        }
      ]
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    );
  }
}