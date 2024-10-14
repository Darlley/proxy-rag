import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Iniciando rota de criação de auth...');
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || user === null || !user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    let dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      // Criar o usuário no banco de dados
      dbUser = await prisma.user.create({
        data: {
          id: user?.id ?? '',
          firstName: user?.given_name ?? '',
          lastName: user?.family_name ?? '',
          name: `${user?.given_name ?? ''} ${user?.family_name ?? ''}`,
          email: user?.email ?? '',
          profileImage:
            user?.picture ?? `https://avatar.vercel.sh/${user?.given_name}`,
        },
      });

      // Criar cliente no Stripe usando os dados do novo dbUser
      const customer = await stripe.customers.create({
        email: dbUser.email,
        name: dbUser.name,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: process.env.STRIPE_FREE_PRICE_ID }],
      });

      // Atualizar o dbUser com o ID do cliente Stripe
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          stripeCustomerId: customer.id,
          stripeSubscriptionId: subscription.id,
          stripeSubscriptionStatus: 'active',
        },
      });
    } else {
      // Se o usuário já existir, buscar o cliente no Stripe
      let customer = (
        await stripe.customers.list({
          email: dbUser.email,
        })
      ).data[0];

      if (!customer) {
        customer = await stripe.customers.create({
          email: dbUser.email,
          name: dbUser.name,
        });
      }
    }

    return NextResponse.redirect(`${process.env.KINDE_SITE_URL!}/dashboard`);
  } catch (error) {
    console.error('Erro na rota de criação de auth:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
