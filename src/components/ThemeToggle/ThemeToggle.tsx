'use client';

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@nextui-org/react';
import { Computer, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) return null;
    switch (theme) {
      case 'dark':
        return <Moon className="size-5 stroke-[1.5]" />;
      case 'light':
        return <Sun className="size-5 stroke-[1.5]" />;
      case 'system':
        return <Computer className="size-5 stroke-[1.5]" />;
      default:
        return <Moon className="size-5 stroke-[1.5]" />;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="bordered"
        >
          {getThemeIcon()}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="faded"
        aria-label="Menu de seleção de tema"
        selectionMode='single'
        onAction={(key) =>
          key != 'all' && setTheme(key as 'dark' | 'light' | 'system')
        }
        selectedKeys={theme}
      >
        <DropdownItem
          key="dark"
          startContent={<Moon className="stroke-[1.5]" />}
        >
          Escuro
        </DropdownItem>
        <DropdownItem
          key="light"
          startContent={<Sun className="stroke-[1.5]" />}
        >
          Claro
        </DropdownItem>
        <DropdownItem
          key="system"
          startContent={<Computer className="stroke-[1.5]" />}
        >
          Sistema
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}