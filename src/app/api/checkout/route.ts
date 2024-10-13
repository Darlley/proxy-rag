import prisma from '@/utils/prisma';
import { requireUser } from '@/utils/requireUser';
import { stripe } from '@/utils/stripe';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId, planId } = await request.json();
  const user = await requireUser();

  if (userId && planId) {
    try {
      // Use o ID do usuário autenticado em vez do userId do corpo da requisição
      let stripeUserId = await prisma.user.findUnique({
        where: {
          id: userId, // Use o ID do usuário autenticado
        },
        select: {
          stripeCustomerId: true,
          email: true,
          firstName: true,
          name: true
        },
      });

      if (!stripeUserId?.stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: stripeUserId?.email ?? '',
          name: stripeUserId?.firstName ?? '',
        });

        stripeUserId = await prisma.user.update({
          where: {
            id: userId, // Use o ID do usuário autenticado
          },
          data: {
            stripeCustomerId: customer?.id,
          },
        });
      }

      let priceId;
      switch (planId) {
        case process.env.STRIPE_STARTUP_PRICE_ID:
          priceId = process.env.STRIPE_STARTUP_PRICE_ID;
          break;
        case process.env.STRIPE_ENTERPRISE_PRICE_ID:
          priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
          break;
        default:
          throw new Error('Plano inválido');
      }

      let customer = (await stripe.customers.list({
        email: stripeUserId.email
      })).data[0];
  
      if (!customer) {
        customer = await stripe.customers.create({
          email: stripeUserId.email,
          name: stripeUserId.name,
        });
      }

      const session = await stripe.checkout.sessions.create({        
        payment_method_types: ['card'], // Aceita pagamentos com cartão
        mode: 'subscription', // Modo de assinatura
        client_reference_id: userId, // Referência ao usuário no sistema
        customer: customer.id,
        success_url: 'http://localhost:3000/dashboard?payment=true',
        billing_address_collection: 'auto',
        customer_update: {
          address: 'auto',
          name: 'auto',
        },
        cancel_url: 'http://localhost:3000/dashboard?payment=false',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
      });

      return NextResponse.json({ url: session.url });
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      return NextResponse.json(
        { error: 'Erro ao processar o checkout' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Erro ao processar o checkout' },
    { status: 500 }
  );
}