'use client';

import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Button, Card, CardBody, CardHeader, Chip } from '@nextui-org/react';
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
                className="w-full h-full rounded-lg"
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

          <footer className="relative z-20 w-full h-20 flex flex-col gap-2 items-center justify-center mt-16">
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

            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="30"
                fill="none"
                viewBox="0 0 1631 472"
              >
                <path
                  d="M.422 412.975c78.105 78.104 204.738 78.104 282.843 0 78.104-78.105 78.104-204.738 0-282.843l-35.356 35.355c58.579 58.579 58.579 153.554 0 212.132-58.578 58.579-153.553 58.579-212.132 0L.422 412.975z"
                  className="fill-emerald-400"
                ></path>
                <path
                  d="M71.133 342.264c39.052 39.052 102.368 39.052 141.421 0 39.052-39.052 39.052-102.369 0-141.421l-35.355 35.355c19.526 19.526 19.526 51.184 0 70.711-19.527 19.526-51.185 19.526-70.711 0l-35.355 35.355z"
                  className="fill-emerald-400"
                ></path>
                <path
                  d="M353.974 59.421c-78.105-78.105-204.738-78.105-282.842 0-78.106 78.105-78.106 204.738 0 282.843l35.354-35.355c-58.578-58.579-58.578-153.554 0-212.132 58.579-58.579 153.554-58.579 212.132 0l35.356-35.356z"
                  className="fill-emerald-300"
                ></path>
                <path
                  d="M283.264 130.132c-39.052-39.052-102.37-39.052-141.422 0-39.053 39.053-39.053 102.369 0 141.421l35.355-35.355c-19.526-19.526-19.526-51.184 0-70.711 19.526-19.526 51.184-19.526 70.711 0l35.356-35.355z"
                  className="fill-emerald-300"
                ></path>
                <path
                  fill="#fff"
                  d="M588.112 264.179c0 24.929-17.791 37.287-34.836 37.287-18.537 0-30.895-13.104-30.895-33.878v-98.224h-38.566v104.19c0 39.311 22.373 61.577 54.546 61.577 24.503 0 41.761-12.891 49.219-31.215h1.704V333h37.394V169.364h-38.566v94.815zm72.223 130.185H698.9v-87.145h1.598c6.073 11.932 18.75 28.657 46.875 28.657 38.566 0 67.436-30.575 67.436-84.481 0-54.546-29.723-84.162-67.542-84.162-28.871 0-40.909 17.365-46.769 29.19h-2.237v-27.059h-37.926v225zm37.819-143.182c0-31.747 13.637-52.308 38.459-52.308 25.675 0 38.885 21.839 38.885 52.308 0 30.682-13.423 53.054-38.885 53.054-24.609 0-38.459-21.307-38.459-53.054zm273.013-38.566c-5.326-27.698-27.486-45.383-65.838-45.383-39.417 0-66.264 19.389-66.157 49.645-.107 23.863 14.595 39.631 46.022 46.129l27.912 5.859c15.021 3.303 22.053 9.375 22.053 18.644 0 11.186-12.145 19.602-30.469 19.602-17.685 0-29.19-7.67-32.493-22.372l-37.606 3.622c4.794 30.043 30.042 47.834 70.206 47.834 40.909 0 69.779-21.2 69.886-52.202-.107-23.331-15.128-37.606-46.023-44.318l-27.912-5.966c-16.619-3.728-23.224-9.481-23.118-18.963-.106-11.079 12.145-18.75 28.232-18.75 17.791 0 27.166 9.695 30.149 20.455l35.156-3.836zm111.023-43.252h-32.27v-39.205h-38.57v39.205h-23.225v29.829h23.225v90.98c-.21 30.789 22.16 45.916 51.14 45.064 10.97-.319 18.53-2.45 22.69-3.835l-6.5-30.149c-2.13.533-6.5 1.491-11.29 1.491-9.7 0-17.47-3.409-17.47-18.963v-84.588h32.27v-29.829zm73.35 166.939c25.67 0 41.01-12.039 48.04-25.782h1.28V333h37.08V223.483c0-43.253-35.27-56.25-66.48-56.25-34.41 0-60.83 15.341-69.36 45.17l36.01 5.114c3.84-11.186 14.7-20.774 33.56-20.774 17.9 0 27.7 9.162 27.7 25.248v.64c0 11.079-11.61 11.612-40.48 14.701-31.75 3.409-62.11 12.891-62.11 49.752 0 32.173 23.54 49.219 54.76 49.219zm10.01-28.339c-16.09 0-27.59-7.35-27.59-21.519 0-14.809 12.89-20.988 30.15-23.438 10.12-1.385 30.36-3.942 35.37-7.99V274.3c0 18.217-14.71 33.664-37.93 33.664zm238.5-95.348c-5.33-27.698-27.49-45.383-65.84-45.383-39.42 0-66.27 19.389-66.16 49.645-.11 23.863 14.6 39.631 46.02 46.129l27.92 5.859c15.02 3.303 22.05 9.375 22.05 18.644 0 11.186-12.15 19.602-30.47 19.602-17.69 0-29.19-7.67-32.49-22.372l-37.61 3.622c4.79 30.043 30.04 47.834 70.21 47.834 40.9 0 69.78-21.2 69.88-52.202-.1-23.331-15.13-37.606-46.02-44.318l-27.91-5.966c-16.62-3.728-23.23-9.481-23.12-18.963-.11-11.079 12.14-18.75 28.23-18.75 17.79 0 27.17 9.695 30.15 20.455l35.16-3.836zm67.88 24.503c0-23.65 14.7-37.287 35.37-37.287 20.24 0 32.17 12.891 32.17 34.944V333h38.57V228.81c0-39.524-22.38-61.577-56.36-61.577-25.14 0-41.12 11.399-48.69 29.936h-1.91v-82.351h-37.72V333h38.57v-95.881z"
                ></path>
              </svg>
            </div>
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
