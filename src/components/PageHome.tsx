'use client';

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Button, Card, CardBody, CardHeader, Chip, Image } from '@nextui-org/react';
import { Brain, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Compare } from '@/components/Compare';
import {
  LoginLink,
  RegisterLink,
} from '@kinde-oss/kinde-auth-nextjs/components';

import { plans } from '@/constants/plans';
import {
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from '@nextui-org/react';
import { AnimationProps, motion } from 'framer-motion';
import DropdownProfile from './DropdownProfile';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

export default function PageHome({
  subscription,
}: {
  subscription?: string | null;
}) {
  const { isAuthenticated, user } = useKindeBrowserClient();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const router = useRouter();
  const [userUrl, setUserUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInitiate = async () => {
    if (userUrl) {
      setIsLoading(true);
      try {
        // Simule uma operação assíncrona
        await new Promise((resolve) => setTimeout(resolve, 2000));
        router.push(`${APP_URL}${userUrl}`);
      } catch (error) {
        console.error('Erro ao iniciar:', error);
        // Trate o erro conforme necessário
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <main className="relative overflow-hidden bg-gray-950 text-gray-200 w-full min-h-svh">
        {isAuthenticated && (
          <div className="flex justify-end w-full fixed top-4 right-4 z-20 ">
            <DropdownProfile />
          </div>
        )}

        <div className="mx-auto max-w-7xl p-4 md:p-8 flex flex-col items-center justify-between min-h-svh">
          <header className="relative z-20 text-center w-full max-w-3xl">
            <span className="mb-4 block w-fit rounded bg-gradient-to-br from-slate-800 to-gray-950 p-2 text-xl md:text-3xl shadow-md shadow-indigo-900 mx-auto">
              <Brain />
            </span>
            <h1 className="mb-4 text-2xl font-semibold leading-tight">
              MY PROXY RAG
            </h1>
            <p className="mb-6 leading-snug text-slate-400 lg:leading-snug">
              O MY-PROXY-RAG permite interagir com qualquer conteúdo público na
              web 🌐 Basta adicionar{' '}
              <code className="font-mono text-blue-500">{APP_URL}</code> na
              frente de qualquer URL pública que você deseja consultar. Ou
              simplesmente clique em começar ⚡
            </p>
          </header>

          <section className="relative z-20 w-full max-w-3xl">
            <div className="p-4 border rounded-2xl bg-gray-900 border-gray-900 mx-auto h-[260px] lg:h-[300px] aspect-video">
              <Compare
                firstImage="/prev.png"
                secondImage="/result.png"
                firstImageClassName="object-cover object-left-top w-full"
                secondImageClassname="object-cover object-left-top w-full"
                className="w-full h-full rounded-xl border-2 border-gray-700"
                slideMode="hover"
                autoplay={true}
              />
            </div>

            <div className="flex justify-center mt-4 gap-4">
              {isAuthenticated ? (
                <Button
                  endContent={<Brain className="size-5 stroke-1" />}
                  color="primary"
                  variant="shadow"
                  className="w-full sm:w-auto"
                  onPress={onOpen}
                >
                  Começar
                </Button>
              ) : (
                <>
                  <LoginLink>
                    <Button variant="shadow" className="w-full sm:w-auto">
                      Entrar
                    </Button>
                  </LoginLink>
                  <RegisterLink>
                    <Button
                      color="primary"
                      variant="shadow"
                      className="w-full sm:w-auto"
                    >
                      Cadastrar
                    </Button>
                  </RegisterLink>
                </>
              )}
            </div>
          </section>

          <section className="relative z-20 mt-16 w-full">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-4xl text-center">
                <h2 className="mt-6 text-4xl font-bold tracking-tight text-gray-200 sm:text-5xl">
                  Escolha o plano ideal para você
                </h2>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`dark:bg-gray-900 border-2 ${
                      subscription &&
                      ((subscription ===
                        process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID &&
                        plan.id === 'free') ||
                        (subscription ===
                          process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID &&
                          plan.id === 'basic') ||
                        (subscription ===
                          process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID &&
                          plan.id === 'pro'))
                        ? 'border-primary'
                        : 'dark:border-gray-800'
                    } p-4 w-full`}
                  >
                    <CardHeader className="flex items-center justify-between">
                      <h3
                        className={`text-lg font-semibold ${
                          plan.mostPopular ? 'text-primary' : 'text-gray-200'
                        }`}
                      >
                        {plan.name}
                      </h3>
                      {plan.mostPopular && (
                        <Chip
                          color="primary"
                          variant="shadow"
                          size="sm"
                          className="text-xs font-semibold"
                        >
                          Mais popular
                        </Chip>
                      )}
                    </CardHeader>
                    <CardBody>
                      <p className="text-sm text-gray-400">
                        {plan.description}
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold text-gray-200">
                          {plan.price.monthly}
                        </span>
                      </p>
                      <ul className="my-8 space-y-3 text-sm text-gray-400">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-x-3">
                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-primary" />
                            {feature.name}
                          </li>
                        ))}
                      </ul>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <footer className="relative z-20 w-full h-20 flex flex-col gap-4 items-center justify-center mt-16">

            <div className="w-full flex flex-col items-center justify-center gap-2">
              <h2 className="text-sm">Tecnologias</h2>
              <div className="flex items-center gap-2">
                <Image src="/tools/neon.png" alt="logo" width={30} height={30} radius='none' />
                <Image src="/tools/stripe.png" alt="logo" width={30} height={30} radius='none' />
                <Image src="/tools/upstash.png" alt="logo" width={30} height={30} radius='none' />
                <Image src="/tools/kinde.jpg" alt="logo" width={30} height={30} radius='none' />
              </div>
            </div>
            
            <p>
              Desenvolvido por{' '}
              <Link
                className="text-primary"
                href="https://darlley.dev"
                target="_blank"
              >
                Darlley Brasil
              </Link>
            </p>
          </footer>
        </div>
        <BGGrid />
      </main>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        classNames={{
          base: 'py-4',
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Inserir URL</ModalHeader>
              <ModalBody>
                <Input
                  type="text"
                  placeholder="Cole a URL aqui"
                  value={userUrl}
                  onChange={(e) => setUserUrl(e.target.value)}
                  description="Cole a URL do artigo que você deseja consultar"
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  disabled={isLoading}
                >
                  Fechar
                </Button>
                <Button
                  color="primary"
                  onPress={handleInitiate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" color="white" />
                      <span className="ml-2">Iniciando...</span>
                    </>
                  ) : (
                    'Iniciar'
                  )}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

const BGGrid = () => {
  return (
    <div
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke-width='2' stroke='rgb(30 27 75 / 0.5)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
      }}
      className="absolute bottom-0 left-0 right-0 top-0"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/0 to-gray-950/80" />
      <Beams />
    </div>
  );
};

const Beams = () => {
  const { width } = useWindowSize();

  const numColumns = width ? Math.floor(width / GRID_BOX_SIZE) : 0;

  const placements = [
    {
      top: GRID_BOX_SIZE * 0,
      left: Math.floor(numColumns * 0.05) * GRID_BOX_SIZE,
      transition: {
        duration: 3.5,
        repeatDelay: 5,
        delay: 2,
      },
    },
    {
      top: GRID_BOX_SIZE * 12,
      left: Math.floor(numColumns * 0.15) * GRID_BOX_SIZE,
      transition: {
        duration: 3.5,
        repeatDelay: 10,
        delay: 4,
      },
    },
    {
      top: GRID_BOX_SIZE * 3,
      left: Math.floor(numColumns * 0.25) * GRID_BOX_SIZE,
    },
    {
      top: GRID_BOX_SIZE * 9,
      left: Math.floor(numColumns * 0.75) * GRID_BOX_SIZE,
      transition: {
        duration: 2,
        repeatDelay: 7.5,
        delay: 3.5,
      },
    },
    {
      top: 0,
      left: Math.floor(numColumns * 0.7) * GRID_BOX_SIZE,
      transition: {
        duration: 3,
        repeatDelay: 2,
        delay: 1,
      },
    },
    {
      top: GRID_BOX_SIZE * 2,
      left: Math.floor(numColumns * 1) * GRID_BOX_SIZE - GRID_BOX_SIZE,
      transition: {
        duration: 5,
        repeatDelay: 5,
        delay: 5,
      },
    },
  ];

  return (
    <>
      {placements.map((p, i) => (
        <Beam
          key={i}
          top={p.top}
          left={p.left - BEAM_WIDTH_OFFSET}
          transition={p.transition || {}}
        />
      ))}
    </>
  );
};

const Beam = ({
  top,
  left,
  transition = {},
}: {
  top: number;
  left: number;
  transition?: AnimationProps['transition'];
}) => {
  return (
    <motion.div
      initial={{
        y: 0,
        opacity: 0,
      }}
      animate={{
        opacity: [0, 1, 0],
        y: 32 * 8,
      }}
      transition={{
        ease: 'easeInOut',
        duration: 3,
        repeat: Infinity,
        repeatDelay: 1.5,
        ...transition,
      }}
      style={{
        top,
        left,
      }}
      className="absolute z-10 h-[64px] w-[1px] bg-gradient-to-b from-indigo-500/0 to-indigo-500"
    />
  );
};

type WindowSize = {
  width: number | undefined;
  height: number | undefined;
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};

const GRID_BOX_SIZE = 32;
const BEAM_WIDTH_OFFSET = 1;
