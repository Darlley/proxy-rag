import ChatWrapper from '@/components/ChatWrapper';
import { ragChat } from '@/lib/rag-chat';
import { redis } from '@/lib/redis';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    url: string | string[] | undefined;
  };
}

const KNOWLEDGE_URL = process.env.NEXT_PUBLIC_KNOWLEDGE_URL!

function reconstructUrl({ url }: { url: string[] }) {
  const decodedComponents = url.map((component) =>
    decodeURIComponent(component)
  );
  return `${decodedComponents[0]}//${decodedComponents.slice(1).join('/')}`
}

export default async function page({ params }: PageProps) {
  const sessionCookie = cookies().get('sessionId')?.value;
  const reconstructedUrl = reconstructUrl({ url: params.url as string[] });

  // Verifica se a URL contém "tabnews.com.br/darlleybbf"
  if (!reconstructedUrl.includes(KNOWLEDGE_URL)) return redirect('/');

  const sessionId = `${reconstructedUrl}--${sessionCookie}`.replace(/\//g, '');

  const isAlreadyIndexed = await redis.sismember(
    'indexed-urls',
    reconstructedUrl
  );

  const initialMessages = await ragChat.history.getMessages({
    amount: 10,
    sessionId,
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
    <ChatWrapper sessionId={sessionId} initialMessages={initialMessages} reconstructedUrl={reconstructedUrl} />
  );
}
