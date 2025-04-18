import { auth } from '@/app/(auth)/auth';
import { getVotesByChatId, voteMessage } from '@/lib/db/queries';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return Response.json('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized', { status: 401 });
  }

  try {
    const votes = await getVotesByChatId({ id: chatId });
    return Response.json(votes);
  } catch (error) {
    return Response.json('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json('Unauthorized', { status: 401 });
  }

  try {
    const { messageId, chatId, type } = await request.json();

    await voteMessage({
      messageId,
      chatId,
      type,
    });

    return Response.json('Vote saved!');
  } catch (error) {
    return Response.json('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
