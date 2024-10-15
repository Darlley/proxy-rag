import ChatWrapper from '@/components/ChatWrapper';
import { plans } from '@/constants/plans';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { notFound } from 'next/navigation';
import { convertPrismaMessageToAiMessage, getRequestsLimit } from '@/utils/conversationUtils';

interface PageProps {
  params: {
    id: string;
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

  const initialMessages = conversation.messages.map(convertPrismaMessageToAiMessage);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    throw new Error('Usuário não encontrado');
  }

  const requestsLimit = getRequestsLimit(dbUser.stripePriceId);

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
