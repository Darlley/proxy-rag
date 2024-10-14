import ChatWrapper from '@/components/ChatWrapper';
import { ragChat } from '@/lib/rag-chat';
import { redis } from '@/lib/redis';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import prisma from '@/lib/prisma';
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

  const planLimits = {
    free: { requests: 20 },
    basic: { requests: 100 },
    pro: { requests: 1000 },
  };

  const userPlan = dbUser.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID
    ? 'basic'
    : dbUser.stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
      ? 'pro'
      : 'free';

  const { requests: requestsLimit } = planLimits[userPlan];

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
