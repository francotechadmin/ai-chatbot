import { auth } from '@/app/(auth)/auth';
import { getChatsByUserId, getChatsByUserIdAndType } from '@/lib/db/queries';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized!', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as 'general' | 'query' | 'capture' | null;

  // biome-ignore lint: Forbidden non-null assertion.
  const userId = session.user.id!;
  
  if (type) {
    const chats = await getChatsByUserIdAndType({ id: userId, type });
    return Response.json(chats);
  } else {
    const chats = await getChatsByUserId({ id: userId });
    return Response.json(chats);
  }
}
