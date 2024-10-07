'use client';

import { Button } from '@nextui-org/react';
import { Message, useChat } from 'ai/react';
import Link from 'next/link';
import { ChatInput } from './ChatInput';
import Messages from './Messages';
import { BookOpen } from 'lucide-react';

interface ChatProps {
  sessionId: string;
  initialMessages: Message[];
  reconstructedUrl: string;
}

export default function ChatWrapper({ sessionId, initialMessages, reconstructedUrl }: ChatProps) {
  const { messages, handleInputChange, input, handleSubmit, setInput } =
    useChat({
      api: '/api/chat-stream',
      body: { sessionId },
      initialMessages
    });

  return (
    <div className="relative h-svh bg-zinc-900 flex divide-y divide-zinc-700 flex-col justify-between gap-2">
      <div className='fixed top-4 right-4'>
        <Button color='primary' startContent={<BookOpen />} as={Link} href={reconstructedUrl}>Voltar para o artigo</Button>
      </div>
      <div className="flex-1 bg-zinc-800 justify-between flex flex-col">
        <Messages messages={messages} />
      </div>

      <ChatInput
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        input={input}
        setInput={setInput}
      />
    </div>
  );
}
