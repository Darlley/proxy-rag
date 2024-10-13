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
export default function DropdownProfile(props: DropdownProfileProps) {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <User
          as="button"
          avatarProps={{
            isBordered: true,
            src: 'https://github.com/darlley.png',
          }}
          className="transition-transform"
          description="@darlleybbf"
          name="Darlley Brito"
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="User Actions"
        variant="flat"
        onAction={(key) => {
          if (key === 'site') {
            router.push('/site');
          }
          if (key === 'dashboard') {
            router.push('/dashboard');
          }
        }}
      >
        <DropdownItem key="profile" className="h-14 gap-2">
          <p className="font-bold">Conectado como</p>
          <p className="font-bold">{user?.email}</p>
        </DropdownItem>
        <DropdownItem key="dashboard">
          Dashboard
        </DropdownItem>
        <DropdownItem key="site">
          Site
        </DropdownItem>
        <DropdownItem key="logout" color="danger">
          <LogoutLink className="w-full flex">Sair</LogoutLink>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
