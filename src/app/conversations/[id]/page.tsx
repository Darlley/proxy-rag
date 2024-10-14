import ChatWrapper from '@/components/ChatWrapper';
import { plans } from '@/constants/plans';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { Message as PrismaMessage } from '@prisma/client';
import { Message as AIMessage } from 'ai';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

function convertPrismaMessageToAiMessage(message: PrismaMessage): AIMessage {
  return {
    id: message.id,
    content: message.content,
    role: message.role as AIMessage['role'],
    createdAt: message.createdAt,
  };
}

export default async function ConversationPage({ params }: PageProps) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: { messages: true },
  });

  if (!conversation || conversation.userId !== user.id) {
    notFound();
  }

  const initialMessages: AIMessage[] = conversation.messages.map(
    convertPrismaMessageToAiMessage
  );

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    throw new Error('Usuário não encontrado');
  }

  let requestsLimit = plans.find(plan => plan.id === 'free')?.features[0].limit || 20;

  if (dbUser.stripeSubscriptionId) {
    if (dbUser.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) {
      requestsLimit = plans.find(plan => plan.id === 'basic')?.features[0].limit || 1000;
    } else if (dbUser.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
      requestsLimit = plans.find(plan => plan.id === 'pro')?.features[0].limit || 10000;
    }
  }

  return (
    <ChatWrapper
      userId={user.id}
      initialMessages={initialMessages}
      requestsUsed={dbUser.requests}
      requestsLimit={requestsLimit}
      conversation={conversation}
    />
  );
}
