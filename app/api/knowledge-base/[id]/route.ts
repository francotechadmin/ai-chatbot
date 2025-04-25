import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getKnowledgeSourceById, getKnowledgeChunksBySourceId, deleteKnowledgeSource } from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure params is properly handled
    const { id } = await params


    // Fetch knowledge source
    const source = await getKnowledgeSourceById(id);
    if (!source) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }
    
    // Fetch chunks for this source
    const chunks = await getKnowledgeChunksBySourceId(id);
    
    return NextResponse.json({ source, chunks });
  } catch (error) {
    console.error('Error fetching knowledge source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch knowledge source' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure params is properly handled
    const id = params.id;
    
    // Fetch knowledge source to check ownership
    const source = await getKnowledgeSourceById(id);
    if (!source) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }
    
    // Check if user is the owner or an admin
    if (source.userId !== session.user.id && session.user.role !== 'admin' && session.user.role !== 'superuser') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete the knowledge source and all associated chunks and relations
    await deleteKnowledgeSource(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting knowledge source:', error);
    return NextResponse.json(
      { error: 'Failed to delete knowledge source' },
      { status: 500 }
    );
  }
}
