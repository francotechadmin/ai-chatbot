'use server';

import { auth } from '@/app/(auth)/auth';
import { 
  getKnowledgeSourcesByStatus, 
  getKnowledgeSourceById, 
  getKnowledgeChunksBySourceId,
  updateKnowledgeSourceStatus,
  deleteKnowledgeSource
} from '@/lib/db/queries';

export async function fetchKnowledgeSources() {
  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Fetch all statuses and combine
  const pendingSources = await getKnowledgeSourcesByStatus('pending');
  const approvedSources = await getKnowledgeSourcesByStatus('approved');
  const rejectedSources = await getKnowledgeSourcesByStatus('rejected');
  
  return [...pendingSources, ...approvedSources, ...rejectedSources];
}

export async function fetchKnowledgeSourceById(id: string) {
  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const source = await getKnowledgeSourceById(id);
  if (!source) {
    throw new Error('Knowledge source not found');
  }
  
  const chunks = await getKnowledgeChunksBySourceId(id);
  
  return { source, chunks };
}

export async function updateSourceStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
  // Authentication and authorization check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  if (session.user.role !== 'admin' && session.user.role !== 'superuser') {
    throw new Error('Unauthorized');
  }

  await updateKnowledgeSourceStatus({
    id,
    status,
    approvedBy: status === 'approved' ? session.user.id : undefined,
  });
  
  return getKnowledgeSourceById(id);
}

export async function deleteSource(id: string) {
  // Authentication check
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  
  const source = await getKnowledgeSourceById(id);
  if (!source) {
    throw new Error('Knowledge source not found');
  }
  
  // Check if user is the owner or an admin
  if (source.userId !== session.user.id && 
      session.user.role !== 'admin' && 
      session.user.role !== 'superuser') {
    throw new Error('Unauthorized');
  }
  
  await deleteKnowledgeSource(id);
  return { success: true };
}