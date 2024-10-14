'use client';

import {
  LogoutLink,
  useKindeBrowserClient,
} from '@kinde-oss/kinde-auth-nextjs';
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { DropdownProfileProps } from './DropdownProfile.types';
import { useState } from 'react';
export default function DropdownProfile(props: DropdownProfileProps) {
  const { user } = useKindeBrowserClient();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleOpenPortal = async () => {
    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error(
          'Erro ao processar o redirecionamento para o portal de cobrança'
        );
      }
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
    }
  };

  return (
    <Dropdown placement="bottom-end" >
      <DropdownTrigger>
        <User
          as="button"
          avatarProps={{
            isBordered: true,
            src: user?.picture || '',
          }}
          className="transition-transform"
          description={user?.email}
          name={user?.given_name + ' ' + user?.family_name}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="User Actions"
        variant="flat"
        onAction={key => {
          if(key === 'payment'){
            handleOpenPortal()
          }
          if(key === 'conversations'){
            router.push('/conversations')
          }
        }}
      >
        <DropdownItem key="payment">
          Gerenciar Assinatura
        </DropdownItem>
        <DropdownItem key="conversations">
          Conversas
        </DropdownItem>
        <DropdownItem key="logout" color="danger">
          <LogoutLink className="w-full flex">Sair</LogoutLink>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
