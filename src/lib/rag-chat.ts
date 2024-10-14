import { RAGChat, upstash } from '@upstash/rag-chat';
import { redis } from './redis';

export const ragChat = new RAGChat({
  model: upstash('meta-llama/Meta-Llama-3-8B-Instruct'),
  redis: redis,
  promptFn: ({ context, question, chatHistory }) =>
    `Você é um assistente que responde perguntas sobre os artigos da url do usuário.
    Responda em português (pt-BR) e seja breve na resposta. 
    Não fuja do contexto. Pode usar emojis.
      ------
      Histórico:
      ${chatHistory}
      ------
      Contexto:
      ${context}
      ------
      Pergunta: ${question}
      Resposta:`,
});
