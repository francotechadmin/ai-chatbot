import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getKnowledgeSourceById, updateKnowledgeSourceStatus } from '@/lib/db/queries';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an admin or superuser
    if (session.user.role !== 'admin' && session.user.role !== 'superuser') {
      console.log(`User ${session.user.id} with role ${session.user.role} attempted to update knowledge source status`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Ensure params is properly handled
    const { id } = await params;
    
    // Get the status from the request body
    const body = await req.json();
    const { status } = body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    
    // Fetch knowledge source to check if it exists
    const source = await getKnowledgeSourceById(id);
    if (!source) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }
    
    // Update the status
    await updateKnowledgeSourceStatus({
      id,
      status: status as 'pending' | 'approved' | 'rejected',
      approvedBy: status === 'approved' ? session.user.id : undefined,
    });
    
    // Fetch the updated source
    const updatedSource = await getKnowledgeSourceById(id);
    
    return NextResponse.json(updatedSource);
  } catch (error) {
    console.error('Error updating knowledge source status:', error);
    return NextResponse.json(
      { error: 'Failed to update knowledge source status' },
      { status: 500 }
    );
  }
}
