import { RAGChat, upstash } from '@upstash/rag-chat';
import { redis } from './redis';

export const ragChat = new RAGChat({
  model: upstash('meta-llama/Meta-Llama-3-8B-Instruct'),
  redis: redis,
  promptFn: ({ context, question, chatHistory }) =>
    `Você é um assistente AI útil e amigável. Responda sempre em português (pt-BR). 
  
  Contexto relevante:
  ${context}

  Pergunta do usuário: ${question}`,
});
