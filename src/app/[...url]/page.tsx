import ChatWrapper from '@/components/ChatWrapper';
import { plans } from '@/constants/plans';
import prisma from '@/lib/prisma';
import { ragChat } from '@/lib/rag-chat';
import { redis } from '@/lib/redis';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import { Message as AIMessage } from 'ai';
import { Message as PrismaMessage } from '@prisma/client';

interface PageProps {
  params: {
    url: string | string[] | undefined;
  };
}

function reconstructUrl({ url }: { url: string[] }) {
  const decodedComponents = url.map((component) =>
    decodeURIComponent(component)
  );
  return decodedComponents.join('/');
}

const getPlanFromStripeId = (stripePriceId: string | null): string => {
  switch (stripePriceId) {
    case process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID:
      return 'basic';
    case process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID:
      return 'pro';
    case process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID:
    default:
      return 'free';
  }
};

function convertPrismaMessageToAiMessage(message: PrismaMessage): AIMessage {
  return {
    id: message.id,
    content: message.content,
    role: message.role as AIMessage['role'],
    createdAt: message.createdAt,
  };
}

async function getOrCreateConversation(userId: string, url: string) {
  let conversation = await prisma.conversation.findFirst({
    where: { userId, url },
    orderBy: { updatedAt: 'desc' },
    include: { messages: true },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId, url },
      include: { messages: true },
    });
  }

  const messages: AIMessage[] = conversation.messages.map(convertPrismaMessageToAiMessage);

  return { ...conversation, messages };
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

  const planLimits = Object.fromEntries(
    plans.map((plan) => [plan.id, plan.features[0].limit])
  );

  const userPlan = getPlanFromStripeId(dbUser.stripePriceId);
  const requestsLimit = planLimits[userPlan];

  const reconstructedUrl = reconstructUrl({ url: params.url as string[] });
  const conversation = await getOrCreateConversation(user.id, reconstructedUrl);

  const initialMessages = conversation.messages;

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
    });
    await redis.sadd('indexed-urls', reconstructedUrl);
  }

  return (
    <ChatWrapper
      userId={user.id}
      initialMessages={initialMessages}
      reconstructedUrl={reconstructedUrl}
      requestsUsed={dbUser.requests}
      requestsLimit={requestsLimit}
      conversationId={conversation.id}
    />
  );
}
