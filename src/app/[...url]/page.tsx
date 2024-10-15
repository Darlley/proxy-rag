import prisma from '@/lib/prisma';
import { ragChat } from '@/lib/rag-chat';
import { redis } from '@/lib/redis';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Message as PrismaMessage } from '@prisma/client';
import { Message as AIMessage } from 'ai';
import { JSDOM } from 'jsdom';
import { redirect } from 'next/navigation';
import { plans } from '@/constants/plans';

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

  // Obter o limite de artigos com base no plano do usuário
  const userPlan = plans.find(plan => plan.id === dbUser.stripePriceId) || plans[0];
  const articleLimit = userPlan.features.find(feature => feature.name.includes('artigos'))?.limit || 2;

  // Verificar se o usuário atingiu o limite de artigos
  if (dbUser.vectorRequests >= articleLimit) {
    throw new Error(`Você atingiu o limite de ${articleLimit} artigos indexados por dia para o seu plano.`);
  }

  // Verificar se a URL já foi indexada no Redis
  const isIndexed = await redis.sismember('indexed-urls', reconstructedUrl);

  if (!isIndexed) {
    // Obter o H1 da página
    const pageH1 = await getPageH1(reconstructedUrl);

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
          userId: user.id,
          url: reconstructedUrl,
        },
        namespace: reconstructedUrl
      },
    });
    await redis.sadd('indexed-urls', reconstructedUrl);

    // Incrementar o contador de vectorRequests
    await prisma.user.update({
      where: { id: user.id },
      data: { vectorRequests: { increment: 1 } },
    });
  }

  // Criar ou obter a conversa usando a URL original e o H1
  const conversation = await getOrCreateConversation(
    user.id,
    reconstructedUrl,
    await getPageH1(reconstructedUrl)
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
  const decodedUrl = decodeURIComponent(url);
  let conversation = await prisma.conversation.findFirst({
    where: { userId, url: decodedUrl },
    orderBy: { updatedAt: 'desc' },
    include: { messages: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId, url: decodedUrl, title: h1 },
      include: { messages: true },
    });
  } else if (!conversation.title && h1) {
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
