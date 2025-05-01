import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getMicrosoftIntegration } from '@/lib/integrations/microsoft/auth';

/**
 * GET: Check if the current user has a Microsoft integration
 */
export async function GET() {
  const session = await auth();
  
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const integration = await getMicrosoftIntegration(session.user.id);
    
    return NextResponse.json({
      connected: !!integration,
      integration: integration ? {
        id: integration.id,
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      } : null
    });
  } catch (error) {
    console.error('Failed to check Microsoft integration status:', error);
    return NextResponse.json({ error: 'Failed to check integration status' }, { status: 500 });
  }
}