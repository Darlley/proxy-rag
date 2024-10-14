import ChatWrapper from '@/components/ChatWrapper';
import { plans } from '@/constants/plans';
import prisma from '@/lib/prisma';
import { ragChat } from '@/lib/rag-chat';
import { redis } from '@/lib/redis';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';

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

export default async function page({ params }: PageProps) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect('/api/auth/login');
  }

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
  const isAlreadyIndexed = await redis.sismember(
    'indexed-urls',
    reconstructedUrl
  );

  const initialMessages = await ragChat.history.getMessages({
    amount: 10,
    sessionId: user.id, // Usando o ID do usuário como sessionId
  });

  if (!isAlreadyIndexed) {
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
    />
  );
}
