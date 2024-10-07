'use client';

import { Button } from '@nextui-org/react';
import { Message, useChat } from 'ai/react';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ChatInput } from './ChatInput';
import Messages from './Messages';

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
    <div className="relative flex flex-col h-svh overflow-hidden">
      <div className='fixed top-4 right-4'>
        <Button color='primary' startContent={<BookOpen />} as={Link} href={reconstructedUrl}>Ir para o artigo</Button>
      </div>

      <div className="flex-grow max-h-full h-full overflow-y-auto bg-gray-950">
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
