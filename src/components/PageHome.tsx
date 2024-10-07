
"use client"

import { Compare } from "@/components/Compare";
import { Brain } from "lucide-react";
import { Highlight } from "prism-react-renderer";

import { Button } from "@nextui-org/react";
import { AnimationProps, motion } from "framer-motion";
import Link from "next/link";
import {
  MouseEventHandler,
  ReactNode,
  useEffect,
  useState,
} from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
const KNOWLEDGE_URL = process.env.NEXT_PUBLIC_KNOWLEDGE_URL

export default function PageHome() {
  return (
    <main className="relative overflow-hidden bg-slate-950 text-slate-200 w-full h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col items-center justify-between h-full">
        <header className="relative z-20 py-10 text-center">
          <span className="mb-4 block w-fit rounded bg-gradient-to-br from-slate-800 to-slate-950 p-3 text-2xl md:text-3xl shadow-md shadow-indigo-900 mx-auto">
            <Brain />
          </span>
          <h1 className="mb-4 text-2xl font-semibold leading-tight sm:text-3xl md:text-4xl">
            MY-PROXY-RAG
          </h1>
          <p className="mb-6 text-base leading-snug text-slate-400 sm:text-lg md:text-xl lg:leading-snug">
            O MY-PROXY-RAG permite interagir com os artigos que escrevi na plataforma TabNews 🎊 Basta adicionar <code className="font-mono text-blue-500">{APP_URL}</code> na frente de qualquer URL de algum artigo em <code className="font-mono text-blue-500">{KNOWLEDGE_URL}</code>.
          </p>
        </header>

        <section className="relative z-20">
          <div className="p-4 border rounded-3xl bg-gray-900 border-gray-900 mx-auto h-[300px] md:h-[400px] aspect-video">
            <Compare
              firstImage="/prev.png"
              secondImage="/result.png"
              firstImageClassName="object-cover object-left-top w-full"
              secondImageClassname="object-cover object-left-top w-full"
              className="w-full h-full rounded-[22px] md:rounded-lg"
              slideMode="hover"
              autoplay={true}
            />
          </div>

          <div className="flex justify-center mt-4">
            <Button
              endContent={<Brain />}
              as={Link}
              color="primary"
              variant="shadow"
              href={`${APP_URL}https://www.tabnews.com.br/darlleybbf/escopos-var-let-const-e-seletores-anotacoes-do-pre-work-bootcamp-react-js-do-fernando-daciuk`}
              target="_blank"
            >
              Testar
            </Button>
          </div>
        </section>

        <footer className="relative z-20 w-full h-20 flex items-center justify-center">
          <p>
            Desenvolvido por <Link className="text-primary" href="https://darlley.dev" target="_blank">Darlley Brasil</Link>
          </p>
        </footer>
      </div>
      <BGGrid />
    </main>
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
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/0 to-slate-950/80" />
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
  transition?: AnimationProps["transition"];
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
        ease: "easeInOut",
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

const ToggleChip = ({
  children,
  selected,
  onClick,
}: {
  children: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => {
  return (
    <button
      onClick={onClick}
      className={`rounded px-1.5 py-0.5 text-sm font-medium transition-colors ${selected ? "bg-indigo-600 text-slate-50" : "bg-slate-900 text-slate-50 hover:bg-slate-700"}`}
    >
      {children}
    </button>
  );
};

const Card = ({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) => {
  return (
    <motion.div
      initial={{
        filter: "blur(4px)",
      }}
      whileInView={{
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.25,
      }}
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950/50 to-slate-900/80 p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

const Markup = ({ code }: { code: string }) => {
  return (
    // @ts-ignore
    <Highlight theme={theme} code={code} language="javascript">
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre style={style}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              <span className="inline-block w-[40px] select-none text-slate-400">
                {i + 1}
              </span>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
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

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
};

const GRID_BOX_SIZE = 32;
const BEAM_WIDTH_OFFSET = 1;

const theme = {
  plain: {
    color: "#e2e8f0",
    backgroundColor: "transparent",
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "#94a3b8)",
        fontStyle: "italic",
      },
    },
    {
      types: ["string", "inserted"],
      style: {
        color: "rgb(195, 232, 141)",
      },
    },
    {
      types: ["number"],
      style: {
        color: "rgb(247, 140, 108)",
      },
    },
    {
      types: ["builtin", "char", "constant", "function"],
      style: {
        color: "rgb(130, 170, 255)",
      },
    },
    {
      types: ["punctuation", "selector"],
      style: {
        color: "rgb(199, 146, 234)",
      },
    },
    {
      types: ["variable"],
      style: {
        color: "rgb(191, 199, 213)",
      },
    },
    {
      types: ["class-name", "attr-name"],
      style: {
        color: "rgb(255, 203, 107)",
      },
    },
    {
      types: ["tag", "deleted"],
      style: {
        color: "rgb(255, 85, 114)",
      },
    },
    {
      types: ["operator"],
      style: {
        color: "rgb(137, 221, 255)",
      },
    },
    {
      types: ["boolean"],
      style: {
        color: "rgb(255, 88, 116)",
      },
    },
    {
      types: ["keyword"],
      style: {
        fontStyle: "italic",
      },
    },
    {
      types: ["doctype"],
      style: {
        color: "rgb(199, 146, 234)",
        fontStyle: "italic",
      },
    },
    {
      types: ["namespace"],
      style: {
        color: "rgb(178, 204, 214)",
      },
    },
    {
      types: ["url"],
      style: {
        color: "rgb(221, 221, 221)",
      },
    },
    {
      types: ["keyword", "variable"],
      style: {
        color: "#c792e9",
        fontStyle: "normal",
      },
    },
  ],
};

const javascriptCode = `import { initializeSDK } from "your-package";

const app = initializeSDK({
    apiKey: "sk_abc123"
});

app.doCoolThing();`;

const pythonCode = `import your_package

app = your_package.init({
    "api_key": "sk_abc123"
})

app.do_cool_thing()`;
