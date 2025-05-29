import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId } from '@/lib/db/queries';
import { logger } from '@/lib/logger';

export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }
  logger.info({ session }, 'Session information');
  
  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: session.user.id! });
  logger.info({ chatsLength: chats.length }, 'Number of chats');
  
  return Response.json(chats);
}
