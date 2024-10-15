import prisma from '@/lib/prisma';
import { ragChat } from '@/lib/rag-chat';
import { redis } from '@/lib/redis';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Message as PrismaMessage } from '@prisma/client';
import { Message as AIMessage } from 'ai';
import { JSDOM } from 'jsdom';
import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    url: string | string[] | undefined;
  };
}

export default async function page({ params }: PageProps) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    throw new Error('Usuário não encontrado');
  }

  const reconstructedUrl = reconstructUrl({ url: params.url as string[] });

  // Obter o H1 da página
  const pageH1 = await getPageH1(reconstructedUrl);

  // Verificar se a URL já foi indexada no Redis
  const isIndexed = await redis.sismember('indexed-urls', reconstructedUrl);

  if (!isIndexed) {
    await ragChat.context.add({
      type: 'html',
      source: reconstructedUrl,
      config: {
        chunkOverlap: 50,
        chunkSize: 200,
      },
      options: {
        metadata: {
          title: pageH1,
        },
      },
    });
    await redis.sadd('indexed-urls', reconstructedUrl);
  }

  // Criar ou obter a conversa usando a URL original e o H1
  const conversation = await getOrCreateConversation(
    user.id,
    reconstructedUrl,
    pageH1
  );

  // Redirecionar para a página de conversa
  redirect(`/conversations/${conversation.id}`);
}

function reconstructUrl({ url }: { url: string[] }) {
  const decodedComponents = url.map((component) =>
    decodeURIComponent(component)
  );
  return decodedComponents.join('/');
}

function convertPrismaMessageToAiMessage(message: PrismaMessage): AIMessage {
  return {
    id: message.id,
    content: message.content,
    role: message.role as AIMessage['role'],
    createdAt: message.createdAt,
  };
}

async function getOrCreateConversation(
  userId: string,
  url: string,
  h1: string | null
) {
  let conversation = await prisma.conversation.findFirst({
    where: { userId, url },
    orderBy: { updatedAt: 'desc' },
    include: { messages: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId, url, title: h1 },
      include: { messages: true },
    });
  } else if (!conversation.title && h1) {
    // Atualiza o título se ele não existir e o h1 for fornecido
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: { title: h1 },
      include: { messages: true },
    });
  }

  const messages: AIMessage[] = conversation.messages.map(
    convertPrismaMessageToAiMessage
  );

  return { ...conversation, messages };
}

async function getPageH1(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const h1 =
      dom.window.document.querySelector('h1')?.textContent?.trim() || null;
    return h1;
  } catch (error) {
    console.error('Erro ao obter o H1 da página:', error);
    return null;
  }
}