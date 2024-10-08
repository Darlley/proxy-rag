import { cn } from '@/lib/utils';
import { type Message } from 'ai/react';
import { Bot, MessageSquare, User } from 'lucide-react';

interface MessagesProps {
  messages: Message[];
}

export default function Messages({ messages }: MessagesProps) {
  return (
    <div>
      {!!messages.length ? (
        messages?.map((currentMessage, index) => (
          <Message
            key={index}
            content={currentMessage.content}
            isUserMessage={currentMessage.role === 'user'}
          />
        ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 h-full">
          <MessageSquare className="size-8 text-blue-500" />
          <h3 className="font-semibold text-xl text-white">Você está pronto!</h3>
          <p className="text-zinc-500 text-sm">
            Faça sua primeira pergunta para começar.
          </p>
        </div>
      )}
    </div>
  );
}

interface MessageProps {
  content: string;
  isUserMessage: boolean;
}

function Message({ content, isUserMessage }: MessageProps) {
  return (
    <div
      className={cn({
        'bg-gray-900': isUserMessage,
        'bg-gray-950': !isUserMessage,
      })}
    >
      <div className="p-6">
        <div className="container mx-auto flex items-start gap-2.5">
          <div
            className={cn(
              'size-10 shrink-0 aspect-square rounded-full border border-gray-900 bg-gray-900 flex justify-center items-center',
              {
                'bg-gray-950 border-gray-900 text-zinc-200': isUserMessage,
              }
            )}
          >
            {isUserMessage ? (
              <User className="size-5" />
            ) : (
              <Bot className="size-5 text-white" />
            )}
          </div>

          <div className="flex flex-col ml-6 w-full">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">
                {isUserMessage ? 'You' : 'Website'}
              </span>
            </div>

            <p className="text-sm font-normal py-2.5 dark:text-white">
              {content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
