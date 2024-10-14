'use client';

import { cn } from '@/lib/utils';
import { Button, ButtonGroup, Textarea } from '@nextui-org/react';
import { Message, useChat } from 'ai/react';
import { BookOpen, Bot, Home, MessageSquare, Send, User } from 'lucide-react';
import Link from 'next/link';
import DropdownProfile from './DropdownProfile';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type HandleInputChange = ReturnType<typeof useChat>['handleInputChange'];
type HandleSubmit = ReturnType<typeof useChat>['handleSubmit'];
type SetInput = ReturnType<typeof useChat>['setInput'];

interface ChatInputProps {
  input: string;
  handleInputChange: HandleInputChange;
  handleSubmit: HandleSubmit;
  setInput: SetInput;
}

interface ChatProps {
  userId: string;
  initialMessages: Message[];
  reconstructedUrl: string;
  requestsUsed: number;
  requestsLimit: number;
}

export default function ChatWrapper({
  userId,
  initialMessages,
  reconstructedUrl,
  requestsUsed,
  requestsLimit,
}: ChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { messages, handleInputChange, input, handleSubmit, setInput } =
    useChat({
      api: '/api/chat-stream',
      body: { userId },
      initialMessages,
    });

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (requestsUsed >= requestsLimit) {
      setError('Você atingiu o limite de solicitações para o seu plano');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await handleSubmit(e);

      // Atualizar o contador de solicitações no banco de dados
      const response = await fetch('/api/update-requests-count', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ increment: 1 }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar contagem de solicitações');
      }

      router.refresh(); // Atualiza os dados da página
    } catch (err) {
      setError('Ocorreu um erro ao enviar a mensagem');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-svh overflow-hidden bg-gray-950">
      <div className="flex flex-col-reverse gap-4 w-full justify-between max-w-4xl mx-auto py-4 px-4 sm:px-6">
        <ButtonGroup>
          <Button
            color="primary"
            startContent={<Home className="size-4 md:size-5 stroke-[1.5]" />}
            as={Link}
            href="/"
          >
            Página inicial
          </Button>
          <Button
            color="primary"
            startContent={
              <BookOpen className="size-4 md:size-5 stroke-[1.5]" />
            }
            as={Link}
            href={reconstructedUrl}
            target="_blank"
          >
            Ler artigo
          </Button>
        </ButtonGroup>
        <DropdownProfile />
      </div>

      <div className="flex-grow max-h-full h-full overflow-y-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
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
                          {currentMessage.role === 'user' ? 'Você' : 'Website'}
                        </span>
                      </div>

                      <p className="text-xs md:text-sm font-normal py-2 md:py-2.5 dark:text-white break-all whitespace-break-spaces">
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
        </div>
      </div>

      <div className="border-t border-gray-900 w-full py-3 md:py-4 px-4 sm:px-6">
        <form onSubmit={handleSendMessage} className="mx-auto w-full max-w-4xl">
          <Textarea
            minRows={4}
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
            endContent={
              <Button
                type="submit"
                color="primary"
                isIconOnly
                disabled={isLoading}
              >
                <Send className="size-4" />
              </Button>
            }
            errorMessage={error}
            isDisabled={isLoading || !!error}
          />
        </form>
      </div>
    </div>
  );
}
