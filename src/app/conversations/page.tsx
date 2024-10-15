'use client';

import DropdownProfile from '@/components/DropdownProfile';
import {
  Button,
  Link,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Conversation {
  id: string;
  title: string | null;
  url: string;
  createdAt: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error('Erro ao buscar conversas');
      }
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setConversations(conversations.filter((conv) => conv.id !== id));
      } else {
        console.error('Erro ao excluir conversa');
      }
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-950 h-svh max-h-full overflow-hidden w-full">

      <div className="max-w-4xl mx-auto h-full">
        <Table
          aria-label="Tabela de conversas"
          topContent={
            <div className="flex items-center gap-4 w-full justify-between max-w-4xl mx-auto mb-4">
              <div className="flex items-center gap-4">
                <Button
                  color="primary"
                  startContent={
                    <ChevronLeft className="size-4 md:size-5 stroke-[1.5]" />
                  }
                  as={Link}
                  href="/"
                  isIconOnly
                  size="sm"
                />
                <h1 className="text-2xl font-bold">Conversas</h1>
              </div>

              <DropdownProfile />
            </div>
          }
          removeWrapper 
        >
          <TableHeader>
            <TableColumn>Título</TableColumn>
            <TableColumn>Ações</TableColumn>
          </TableHeader>
          <TableBody>
            {conversations.map((conversation) => (
              <TableRow key={conversation.id}>
                <TableCell>
                  <Link href={`/conversations/${conversation.id}`}>
                    {conversation.title || 'Sem título'}
                  </Link>
                </TableCell>
                <TableCell>
                  <Button
                    color="danger"
                    onClick={() => deleteConversation(conversation.id)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
