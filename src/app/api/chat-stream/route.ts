import { ragChat } from '@/lib/rag-chat';
import { aiUseChatAdapter } from '@upstash/rag-chat/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  const { messages, sessionId, url } = await req.json();

  const lastMessage = messages[messages.length - 1].content;

  const response = await ragChat.chat(lastMessage, {
    streaming: true,
    sessionId,
    url,
  });

  return aiUseChatAdapter(response)
};
