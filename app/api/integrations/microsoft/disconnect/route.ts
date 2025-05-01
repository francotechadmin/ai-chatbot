import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { deleteMicrosoftIntegration } from '@/lib/integrations/microsoft/auth';

/**
 * POST: Disconnect Microsoft integration for the current user
 */
export async function POST() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    await deleteMicrosoftIntegration(session.user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Microsoft integration disconnected successfully'
    });
  } catch (error) {
    console.error('Failed to disconnect Microsoft integration:', error);
    return NextResponse.json({ error: 'Failed to disconnect integration' }, { status: 500 });
  }
}