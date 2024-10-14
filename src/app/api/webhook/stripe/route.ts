import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import Stripe from 'stripe';

/**
 * Manipula webhooks do Stripe para processar eventos de assinatura.
 * @param req - O objeto de requisição recebido.
 * @returns Uma resposta indicando o sucesso ou falha do processamento do webhook.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verifica a assinatura do webhook para garantir que veio do Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Erro na verificação do webhook:', error);
    return new Response('Erro no webhook', { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Processa o evento de conclusão de checkout
  if (event.type === 'checkout.session.completed') {
    await handleCheckoutSessionCompleted(session);
  }

  // Processa o evento de atualização de assinatura
  if (event.type === 'customer.subscription.updated') {
    await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
  }

  // Adicione este novo evento
  if (event.type === 'customer.subscription.created') {
    await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
  }

  // Processa o evento de cancelamento de assinatura
  if (event.type === 'customer.subscription.deleted') {
    await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
  }

  return new Response('Webhook recebido', { status: 200 });
}

/**
 * Manipula o evento de conclusão de checkout.
 * @param session - A sessão de checkout do Stripe.
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  const customerId = session.customer as string;

  await prisma.user.update({
    where: { stripeCustomerId: customerId },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
    },
  });
}

/**
 * Manipula o evento de atualização de assinatura.
 * @param subscription - A assinatura do Stripe.
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
    },
  });
}

/**
 * Manipula o evento de criação de assinatura.
 * @param subscription - A assinatura do Stripe.
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      stripeSubscriptionId: subscription.id,
      stripeSubscriptionStatus: subscription.status,
      stripePriceId: subscription.items.data[0].price.id,
    },
  });
}

/**
 * Manipula o evento de cancelamento de assinatura.
 * @param subscription - A assinatura do Stripe.
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.user.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      stripeSubscriptionStatus: 'canceled',
      stripePriceId: null,
    },
  });
}
