import { Message as PrismaMessage } from '@prisma/client';
import { Message as AIMessage } from 'ai';
import { plans } from '@/constants/plans';

export function convertPrismaMessageToAiMessage(message: PrismaMessage): AIMessage {
  return {
    id: message.id,
    content: message.content,
    role: message.role as AIMessage['role'],
    createdAt: message.createdAt,
  };
}

export function getRequestsLimit(stripePriceId: string | null): number {
  if (!stripePriceId) {
    return plans.find(plan => plan.id === 'free')?.features[0].limit || 20;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID) {
    return plans.find(plan => plan.id === 'basic')?.features[0].limit || 1000;
  }
  if (stripePriceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) {
    return plans.find(plan => plan.id === 'pro')?.features[0].limit || 10000;
  }
  return plans.find(plan => plan.id === 'free')?.features[0].limit || 20;
}

