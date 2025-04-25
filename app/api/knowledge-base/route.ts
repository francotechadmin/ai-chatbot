import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getKnowledgeSourcesByStatus } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;

    // Fetch knowledge sources based on status
    let sources;
    if (status) {
      sources = await getKnowledgeSourcesByStatus(status);
    } else {
      // Fetch all statuses and combine
      const pendingSources = await getKnowledgeSourcesByStatus('pending');
      const approvedSources = await getKnowledgeSourcesByStatus('approved');
      const rejectedSources = await getKnowledgeSourcesByStatus('rejected');
      sources = [...pendingSources, ...approvedSources, ...rejectedSources];
    }

    return NextResponse.json(sources);
  } catch (error) {
    console.error('Error fetching knowledge sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge sources' },
      { status: 500 }
    );
  }
}
