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
    // Delete the Microsoft integration for this user
    await deleteMicrosoftIntegration(session.user.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Microsoft integration:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect from Microsoft' }, 
      { status: 500 }
    );
  }
}