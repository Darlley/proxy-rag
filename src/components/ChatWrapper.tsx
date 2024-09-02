'use client';

import { Message, useChat } from 'ai/react';
import { ChatInput } from './ChatInput';
import Messages from './Messages';

interface ChatProps {
  sessionId: string;
  initialMessages: Message[]
}

export default function ChatWrapper({ sessionId, initialMessages }: ChatProps) {
  const { messages, handleInputChange, input, handleSubmit, setInput } =
    useChat({
      api: '/api/chat-stream',
      body: { sessionId },
      initialMessages
    });

  return (
    <div className="relative h-svh bg-zinc-900 flex divide-y divide-zinc-700 flex-col justify-between gap-2">
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
