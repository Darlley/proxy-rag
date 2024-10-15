import { ragChat } from '@/lib/rag-chat';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { aiUseChatAdapter } from '@upstash/rag-chat/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  const { messages, sessionId, url } = await req.json();

  const { isAuthenticated } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const lastMessage = messages[messages.length - 1].content;
  const decodedUrl = decodeURIComponent(url);

  try {
    const response = await ragChat.chat(lastMessage, {
      streaming: true,
      sessionId,
      namespace: decodedUrl
    });

    return aiUseChatAdapter(response);
  } catch (error) {
    console.error('Erro ao processar o chat:', error);
    return NextResponse.json({ error: "Erro ao processar o chat" }, { status: 500 });
  }
};
