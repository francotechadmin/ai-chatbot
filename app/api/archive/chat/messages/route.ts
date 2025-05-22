import { auth } from '@/app/(auth)/auth';
import { getChatById } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response('Unauthorized', { status: 401 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Determine the chat type and forward to the appropriate API
  const chatType = chat.type || 'general';
  let apiUrl: string;

  if (chatType === 'query') {
    apiUrl = `/api/query/chat/messages?chatId=${chatId}`;
  } else if (chatType === 'capture') {
    apiUrl = `/api/capture/chat/messages?chatId=${chatId}`;
  } else {
    // Default to general chat messages
    apiUrl = `/api/general/chat/messages?chatId=${chatId}`;
  }

  // Forward the request to the appropriate API
  const response = await fetch(new URL(apiUrl, request.url));
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
