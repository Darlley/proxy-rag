'use client';

import { Button, Textarea } from '@nextui-org/react';
import { type useChat } from 'ai/react';
import { Send } from 'lucide-react';

type HandleInputChange = ReturnType<typeof useChat>['handleInputChange'];
type HandleSubmit = ReturnType<typeof useChat>['handleSubmit'];
type SetInput = ReturnType<typeof useChat>['setInput'];

interface ChatInputProps {
  input: string;
  handleInputChange: HandleInputChange;
  handleSubmit: HandleSubmit;
  setInput: SetInput;
}

export const ChatInput = ({
  handleInputChange,
  handleSubmit,
  input,
  setInput,
}: ChatInputProps) => {
  return (
    <div className="bg-gray-950 border-t border-gray-900 w-full">
      <form onSubmit={handleSubmit} className="mx-auto container p-4">
              <Textarea
                minRows={4}
                autoFocus
                onChange={handleInputChange}
                value={input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                    setInput('');
                  }
                }}
                placeholder="Faça sua pergunta..."
                endContent={<Button
                  type="submit"
                  color="primary"
                  isIconOnly
                >
                  <Send className="size-4" />
                </Button>}
                className="resize-none bg-zinc-800 hover:bg-zinc-900 rounded-xl text-base"
              />
            </form>
    </div>
  );
};
