'use client';

import { cn } from '@/lib/utils';
import { Button, ButtonGroup, Textarea } from '@nextui-org/react';
import { Conversation } from '@prisma/client'; // Importe o tipo Conversation
import { Message, useChat } from 'ai/react';
import {
  Bot,
  ChevronLeft,
  Home,
  LinkIcon,
  MessageSquare,
  Send,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DropdownProfile from './DropdownProfile';

interface ChatProps {
  userId: string;
  initialMessages: Message[];
  requestsUsed: number;
  requestsLimit: number;
  conversation: Conversation; // Substituímos as props individuais pela conversa completa
}

export default function ChatWrapper({
  userId,
  initialMessages,
  requestsUsed,
  requestsLimit,
  conversation, // Agora recebemos a conversa completa
}: ChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { messages, handleInputChange, input, handleSubmit, setInput } =
    useChat({
      api: '/api/chat-stream',
      body: { userId, conversationId: conversation.id },
      initialMessages,
      onFinish: async (message) => {
        // Salvar a mensagem no banco de dados
        await saveMessageToDatabase(
          message.content,
          message.role,
          conversation.id
        );
      },
    });

  const saveMessageToDatabase = async (
    content: string,
    role: string,
    conversationId: string
  ) => {
    try {
      const response = await fetch('/api/save-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          role,
          conversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Falha ao salvar a mensagem no banco de dados'
        );
      }
    } catch (error) {
      console.error('Erro ao salvar a mensagem:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (requestsUsed >= requestsLimit) {
      setError('Você atingiu o limite de solicitações para o seu plano');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Salvar a mensagem do usuário no banco de dados
      await saveMessageToDatabase(input, 'user', conversation.id);

      // Atualizar o contador de solicitações no banco de dados
      const updateResponse = await fetch('/api/update-requests-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, increment: 1 }),
      });

      if (!updateResponse.ok) {
        throw new Error('Falha ao atualizar contagem de solicitações');
      }

      // Enviar a mensagem para o chat
      await handleSubmit(e);

      // Atualizar a página para refletir a nova contagem de solicitações
      router.refresh();
    } catch (err) {
      setError('Ocorreu um erro ao enviar a mensagem');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-svh overflow-hidden bg-gray-950">
      <div className="flex items-center gap-4 w-full justify-start max-w-4xl mx-auto py-4 px-4 sm:px-6">
        <ButtonGroup>
          <Button
            color="primary"
            startContent={
              <ChevronLeft className="size-4 md:size-5 stroke-[1.5]" />
            }
            as={Link}
            href="/conversations"
            isIconOnly
          />
          <Button
            color="primary"
            startContent={<Home className="size-4 md:size-5 stroke-[1.5]" />}
            as={Link}
            href="/"
            isIconOnly
          />
        </ButtonGroup>
        <DropdownProfile />
        {/* Usando o título da conversa */}
      </div>

      <div className="flex-grow max-h-full h-full overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto h-full">
          <>
            {messages.length > 0 ? (
              messages.map((currentMessage, index) => (
                <div
                  key={index}
                  className={cn({
                    'bg-gray-900 rounded-lg': currentMessage.role === 'user',
                  })}
                >
                  <div className="p-3 md:p-4">
                    <div
                      className={cn({
                        'max-w-4xl mx-auto flex flex-row-reverse items-start gap-2 md:gap-2.5':
                          currentMessage.role === 'user',
                        'max-w-4xl mx-auto flex items-start gap-2 md:gap-2.5':
                          currentMessage.role !== 'user',
                      })}
                    >
                      <div
                        className={cn(
                          'size-8 md:size-10 shrink-0 aspect-square rounded-full border border-gray-900 bg-gray-900 flex justify-center items-center',
                          {
                            'bg-gray-950 border-gray-900 text-zinc-200':
                              currentMessage.role === 'user',
                          }
                        )}
                      >
                        {currentMessage.role === 'user' ? (
                          <User className="size-4 md:size-5" />
                        ) : (
                          <Bot className="size-4 md:size-5 text-white" />
                        )}
                      </div>

                      <div className="flex flex-col ml-2 md:ml-4 w-full">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs md:text-sm font-semibold text-white">
                            {currentMessage.role === 'user'
                              ? 'Você'
                              : 'Website'}
                          </span>
                        </div>

                        <p className="text-xs md:text-sm font-normal py-2 md:py-2.5 dark:text-white break-words whitespace-break-spaces">
                          {currentMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 h-full">
                <MessageSquare className="size-8 text-blue-500" />
                <h3 className="font-semibold text-xl text-white">
                  Você está pronto!
                </h3>
                <p className="text-zinc-500 text-sm">
                  Faça sua primeira pergunta para começar.
                </p>
              </div>
            )}

            {error && (
              <div>
                <div className="p-3 md:p-4 bg-danger/10 rounded-lg">
                  <div className="max-w-4xl mx-auto flex items-start gap-2 md:gap-2.5 ">
                    <div
                      className={cn(
                        'size-8 md:size-10 shrink-0 aspect-square rounded-full border border-danger flex justify-center items-center'
                      )}
                    >
                      <Bot className="size-4 md:size-5 text-danger" />
                    </div>

                    <div className="flex flex-col ml-2 md:ml-4 w-full">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs md:text-sm font-semibold text-danger">
                          Website
                        </span>
                      </div>

                      <p className="text-xs md:text-sm font-normal py-2 md:py-2.5 dark:text-danger break-words whitespace-break-spaces">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        </div>
      </div>

      <div className="border-t border-gray-900 w-full py-3 md:py-4 px-4 sm:px-6">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto w-full max-w-4xl flex flex-col gap-2"
        >
          <Textarea
            minRows={2}
            autoFocus
            onChange={handleInputChange}
            value={input}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
                setInput('');
              }
            }}
            placeholder="Faça sua pergunta..."
            errorMessage={error}
            isDisabled={isLoading || !!error}
          />

          <div className="flex items-center justify-between gap-4 mt-2">
            <Link
              href={conversation.url}
              target="_blank"
              className="flex items-center gap-2 hover:text-primary transition-colors hover:underline text-xs"
            >
              {conversation.title || conversation.url}{' '}
              <LinkIcon className="size-3" />
            </Link>
            <Button
              type="submit"
              color="primary"
              isIconOnly
              disabled={isLoading || !!error}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
